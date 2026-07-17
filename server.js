const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware (with high limit size for Base64 image transfers)
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
    // 1. Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            reg_number TEXT UNIQUE NOT NULL,
            whatsapp_number TEXT NOT NULL,
            password_hash TEXT NOT NULL
        )
    `);

    // 2. Marketplace Listings table
    db.run(`
        CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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

// 1. SIGN UP (POST http://localhost:3000/api/auth/signup)
app.post('/api/auth/signup', async (req, res) => {
    const { fullname, regNumber, whatsapp, password } = req.body;

    // Strict regex validation matching frontend gatekeeper
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

// 2. SIGN IN (POST http://localhost:3000/api/auth/signin)
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

/* ==========================================
   MARKETPLACE & LISTINGS ENDPOINTS
   ========================================== */

// 3. POST NEW LISTING (POST http://localhost:3000/api/listings)
app.post('/api/listings', (req, res) => {
    const { title, category, price, contact_number, item_condition, security_condition, location_details, image_path } = req.body;

    if (!title || !category || !price || !contact_number) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const sql = `INSERT INTO listings (title, category, price, contact_number, item_condition, security_condition, location_details, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, category, price, contact_number, item_condition, security_condition, location_details, image_path || null], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Listing published successfully!", id: this.lastID });
    });
});

// 4. GET ACTIVE LISTINGS BY CATEGORY (GET http://localhost:3000/api/listings?category=XYZ)
app.get('/api/listings', (req, res) => {
    const { category } = req.query;

    if (!category) {
        return res.status(400).json({ status: "error", message: "Category query parameter is required." });
    }

    const sql = `SELECT * FROM listings WHERE category = ? ORDER BY id DESC`;

    db.all(sql, [category], (err, rows) => {
        if (err) {
            return res.status(500).json({ status: "error", error: err.message });
        }
        res.status(200).json({
            status: "success",
            listings: rows
        });
    });
});

// Start the application server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://127.0.0.1:${PORT}`);
});