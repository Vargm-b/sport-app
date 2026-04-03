const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.post('/registrar', async (req, res) => {
  const { nombre, orden, valor } = req.body;

  try {
    const existe = await pool.query(
      'SELECT item FROM deportes WHERE item = $1',
      [nombre]
    );

    if (existe.rows.length > 0) {
      return res.json({ ok: false, mensaje: 'ese deporte ya fue registrado' });
    }

    await pool.query(
      'INSERT INTO deportes (item, posicion, valor) VALUES ($1, $2, $3)',
      [nombre, orden, valor]
    );

    res.json({ ok: true, mensaje: 'deporte registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, mensaje: 'error' });
  }
});

app.get('/deportes', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT item AS nombre, posicion AS orden, valor FROM deportes ORDER BY posicion'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`corriendo en http://localhost:${port}`);
});
