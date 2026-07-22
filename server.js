require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize SQLite Database
const db = new sqlite3.Database(path.join(__dirname, 'domasi_hub.db'), (err) => {
    if (err) {
        console.error("Failed to connect to local SQLite database:", err.message);
    } else {
        console.log("Connected to SQLite database successfully.");
        createTables();
    }
});

// Structural Table Generation
function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            reg_number TEXT UNIQUE NOT NULL,
            whatsapp_number TEXT NOT NULL,
            password_hash TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            posted_by TEXT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            contact_number TEXT NOT NULL,
            item_condition TEXT,
            security_condition TEXT,
            location_details TEXT,
            image_path TEXT
        )
    `);
}

/* ==========================================
   AUTHENTICATION ENDPOINTS
   ========================================== */

app.post('/api/auth/signup', async (req, res) => {
    const { fullname, regNumber, whatsapp, password } = req.body;

    const regPattern = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i;
    if (!regPattern.test(regNumber)) {
        return res.status(400).json({ status: "error", message: "Invalid registration format." });
    }

    if (!fullname || !whatsapp || !password) {
        return res.status(400).json({ status: "error", message: "All fields are required." });
    }

    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const sql = `INSERT INTO users (full_name, reg_number, whatsapp_number, password_hash) VALUES (?, ?, ?, ?)`;
        
        db.run(sql, [fullname, regNumber, whatsapp, passwordHash], function (err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(400).json({ status: "error", message: "This registration number is already registered." });
                }
                return res.status(500).json({ status: "error", message: "Database save error." });
            }
            res.status(201).json({ status: "success", message: "Registration successful!" });
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Server error." });
    }
});

app.post('/api/auth/signin', (req, res) => {
    const { regNumber, password } = req.body;

    if (!regNumber || !password) {
        return res.status(400).json({ status: "error", message: "All fields are required." });
    }

    const sql = `SELECT full_name, password_hash FROM users WHERE reg_number = ?`;
    
    db.get(sql, [regNumber], async (err, user) => {
        if (err) {
            return res.status(500).json({ status: "error", message: "Database connection failed." });
        }
        if (!user) {
            return res.status(401).json({ status: "error", message: "Invalid credentials." });
        }

        try {
            const match = await bcrypt.compare(password, user.password_hash);
            if (match) {
                res.status(200).json({
                    status: "success",
                    message: "Login successful!",
                    user: {
                        fullname: user.full_name,
                        regNumber: regNumber
                    }
                });
            } else {
                res.status(401).json({ status: "error", message: "Invalid credentials." });
            }
        } catch (error) {
            res.status(500).json({ status: "error", message: "Decryption error." });
        }
    });
});

app.post('/api/admin/signin', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: "error", message: "Username and password required." });
    }

    const cleanUser = username.toLowerCase().trim();

    const adminPasswords = {
        craig: process.env.ADMIN_CRAIG_PASS,
        eden: process.env.ADMIN_EDEN_PASS,
        msosa: process.env.ADMIN_MSOSA_PASS
    };

    const storedPassword = adminPasswords[cleanUser];

    if (storedPassword && password === storedPassword) {
        return res.status(200).json({
            status: "success",
            message: "Admin authenticated successfully!",
            username: cleanUser
        });
    } else {
        return res.status(401).json({
            status: "error",
            message: "Invalid admin username or password."
        });
    }
});

/* ==========================================
   MARKETPLACE & LISTINGS ENDPOINTS
   ========================================== */

app.post('/api/listings', (req, res) => {
    const { posted_by, title, category, price, contact_number, item_condition, security_condition, location_details, image_path } = req.body;

    if (!title || !category || !price || !contact_number) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const sql = `INSERT INTO listings (posted_by, title, category, price, contact_number, item_condition, security_condition, location_details, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [posted_by || 'Anonymous Student', title, category, price, contact_number, item_condition, security_condition, location_details, image_path || null], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Listing published successfully!", id: this.lastID });
    });
});

app.get('/api/listings', (req, res) => {
    const { category } = req.query;

    let sql = `SELECT * FROM listings ORDER BY id DESC`;
    let params = [];

    if (category) {
        sql = `SELECT * FROM listings WHERE category = ? ORDER BY id DESC`;
        params = [category];
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ status: "error", error: err.message });
        }
        res.status(200).json({
            status: "success",
            listings: rows
        });
    });
});

app.delete('/api/listings/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM listings WHERE id = ?`;

    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ status: "error", error: err.message });
        }
        res.status(200).json({ status: "success", message: "Listing deleted successfully." });
    });
});

app.put('/api/listings/:id', (req, res) => {
    const { id } = req.params;
    const { title, price } = req.body;

    const sql = `UPDATE listings SET title = ?, price = ? WHERE id = ?`;

    db.run(sql, [title, price, id], function (err) {
        if (err) {
            return res.status(500).json({ status: "error", error: err.message });
        }
        res.status(200).json({ status: "success", message: "Listing updated successfully." });
    });
});

/* ==========================================
   STATIC FILES & SERVER START
   ========================================== */

app.use(express.static(path.join(__dirname)));

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Backend server is running on http://127.0.0.1:${PORT}`);
});.