const express = require('express');
const path = require('path');
const itemsRoutes = require('./routes/items');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/api/items', itemsRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

async function iniciar() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS deportes(
      item VARCHAR(50) PRIMARY KEY,
      posicion INTEGER UNIQUE,
      valor INTEGER NOT NULL
    )
  `);
  console.log('Tabla deportes lista.');

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

iniciar().catch(err => {
  console.error('Error al iniciar:', err);
  process.exit(1);
});