-- Enable UUID extension if you need it later
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        TEXT UNIQUE NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listings (
    id                  SERIAL PRIMARY KEY,
    category            TEXT,
    title               TEXT,
    item_condition      TEXT,
    security_condition  TEXT,
    location_details    TEXT,
    price               REAL,
    contact_number      TEXT,
    image_path          TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    file_path   TEXT NOT NULL,
    uploaded_by INTEGER,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resources_uploaded_by 
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notices (
    id          SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    posted_by   INTEGER,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notices_posted_by 
        FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Optional: indexes for faster lookups
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_resources_uploaded_by ON resources(uploaded_by);
CREATE INDEX idx_notices_posted_by ON notices(posted_by);
