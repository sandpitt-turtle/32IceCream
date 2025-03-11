const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL
    || 'postgres://localhost/acme_cream_notes_db')
const express = require('express')
const app = express()
app.use(require('morgan')('dev'))


//Array of flavors
app.get('/api/flavors', async (req, res, next) => {
    try {
      const SQL = `
        SELECT * from flavors ORDER BY created_at DESC;
      `
      const response = await client.query(SQL)
      res.send(response.rows)
    } catch (ex) {
      next(ex)
    }
  })
  
//Single Flavor
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM flavors WHERE id = $1;`;
        const response = await client.query(SQL, [req.params.id]);
      res.send(response.rows[0])
    } catch (ex) {
      next(ex)
    }
  })

//CREATE
app.post('/api/flavors', async (req, res, next) => {
    try {
        const { name, is_favorite } = req.body;
        const SQL = `
          INSERT INTO flavors(name, is_favorite)
          VALUES($1, $2)
          RETURNING *;
        `;
        const response = await client.query(SQL, [name, is_favorite]);
      res.send(response.rows[0])
    } catch (ex) {
      next(ex)
    }
  })


//DELETE
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
      const SQL = `DELETE FROM flavors WHERE id = $1;`;
      const response = await client.query(SQL, [req.params.id]);
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  })


//UPDATE

app.put('/api/flavors/:id', async (req, res, next) => {
    try {
      const { name, is_favorite } = req.body;
      const SQL = `
        UPDATE flavors
        SET name=$1, is_favorite=$2, updated_at= now()
        WHERE id=$3 RETURNING *;
      `;
      const response = await client.query(SQL, [name, is_favorite, req.params.id]);
      if (response.rows.length === 0) return res.status(404).json({ error: "Flavor not found" });
      res.json(response.rows[0]);
    } catch (ex) {
      next(ex);
    }
  });


const init = async () => {
    await client.connect();
    console.log('connected to database');
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
    console.log('tables created');
    SQL = `
    
INSERT INTO flavors (name, is_favorite) VALUES 
    ('Vanilla', TRUE),
    ('Chocolate', TRUE),
    ('Strawberry', FALSE),
    ('Coffee', FALSE),
    ('Mint Chocolate Chip', TRUE);

    `;

    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))

  };
  
  init();