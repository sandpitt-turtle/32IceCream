require('dotenv').config();
const pg = require('pg');
const express = require('express');
const morgan = require('morgan');

const app = express();
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_cream_notes_db');

app.use(morgan('dev'));
app.use(express.json()); // Allows JSON request body parsing

// all flavors
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM flavors ORDER BY created_at DESC;`;
        const response = await client.query(SQL);
        res.json(response.rows);
    } catch (ex) {
        console.error(ex);
        next(ex);
    }
});

// single flavor
app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM flavors WHERE id = $1;`;
        const response = await client.query(SQL, [req.params.id]);
        if (response.rows.length === 0) return res.status(404).json({ error: "Flavor not found" });
        res.json(response.rows[0]);
    } catch (ex) {
        console.error(ex);
        next(ex);
    }
});

// Create flavor
app.post('/api/flavors', async (req, res, next) => {
    try {
        const { name, is_favorite } = req.body;
        const SQL = `INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *;`;
        const response = await client.query(SQL, [name, is_favorite]);
        res.status(201).json(response.rows[0]);
    } catch (ex) {
        console.error(ex);
        next(ex);
    }
});

// Update flavor
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const { name, is_favorite } = req.body;
        const SQL = `UPDATE flavors SET name=$1, is_favorite=$2, updated_at=NOW() WHERE id=$3 RETURNING *;`;
        const response = await client.query(SQL, [name, is_favorite, req.params.id]);
        if (response.rows.length === 0) return res.status(404).json({ error: "Flavor not found" });
        res.json(response.rows[0]);
    } catch (ex) {
        console.error(ex);
        next(ex);
    }
});

// Delete flavor
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `DELETE FROM flavors WHERE id = $1 RETURNING *;`;
        const response = await client.query(SQL, [req.params.id]);
        if (response.rows.length === 0) return res.status(404).json({ error: "Flavor not found" });
        res.sendStatus(204);
    } catch (ex) {
        console.error(ex);
        next(ex);
    }
});

// Initialize & start 
const init = async () => {
    try {
        await client.connect();
        console.log('Connected to database');

        let SQL = `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        `;
        await client.query(SQL);
        console.log('Table created');

        const seedSQL = `
        INSERT INTO flavors (name, is_favorite) VALUES 
            ('Vanilla', TRUE),
            ('Chocolate', TRUE),
            ('Strawberry', FALSE),
            ('Coffee', FALSE),
            ('Mint Chocolate Chip', TRUE);
        `;
        await client.query(seedSQL);
        console.log('Data seeded');

        const port = process.env.PORT || 3000;
        app.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (ex) {
        console.error("Error initializing database:", ex);
    }
};

init();
