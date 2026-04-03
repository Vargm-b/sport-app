import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } 
});

app.post('/item', async (req, res) => {
  const { name, value, posicion } = req.body;

  try {
    const nextPosicion = Number.isInteger(posicion)
      ? posicion
      : (await dbPool.query('SELECT COALESCE(MAX(posicion), 0) + 1 AS next_pos FROM deportes'))
          .rows[0].next_pos;

    const queryResult = await dbPool.query(
      'INSERT INTO deportes (item, posicion, valor) VALUES ($1, $2, $3) RETURNING item AS name, valor AS value, posicion',
      [name, nextPosicion, value]
    );
    res.status(201).json(queryResult.rows[0]);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/item', async (req, res) => {
  try {
    const queryResult = await dbPool.query(
      'SELECT item AS name, valor AS value, posicion FROM deportes ORDER BY valor ASC'
    );
    res.status(200).json(queryResult.rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});