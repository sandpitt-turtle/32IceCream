const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL
    || 'postgres://localhost/acme_cream_notes_db')
const express = require('express')
const app = express()


const init = async () => {
    await client.connect();
    console.log('connected to database');
    let SQL = ``;
    await client.query(SQL);
    console.log('tables created');
    SQL = ` `;
    await client.query(SQL);
    console.log('data seeded');
  };
  
  init();