const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL
    || 'postgres://localhost/acme_cream_notes_db')
const express = require('express')
const app = express()
app.use(require('morgan')('dev'))




const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = `
    
    CREATE TABLE flavors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
    
    `;

    await client.query(SQL);
    console.log('tables created');
    SQL = `
    
INSERT INTO flavors (name, is_favorite) VALUES 
    ('Vanilla', TRUE),
    ('Chocolate', TRUE),
    ('Strawberry', FALSE),
    ('Coffee'), FALSE),
    ('Mint Chocolate Chip', TRUE),
    `;

    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))

  };
  
  init();