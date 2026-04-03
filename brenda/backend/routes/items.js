const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT item, posicion, valor FROM deportes ORDER BY posicion ASC'
    );
    return res.json(result.rows);
  } catch (error){
    return res.status(500).json({ error: 'Error al obtener datos' });
  }
});

router.get('/posicion/:pos', async (req, res) => {
  try {
    const pos = Number(req.params.pos);

    if (Number.isNaN(pos) || pos <= 0){
      return res.status(400).json({ error: 'Posición inválida' });
    }

    const result = await pool.query(
      'SELECT item, posicion, valor FROM deportes WHERE posicion = $1',
      [pos]
    );

    return res.json({
      existe: result.rows.length > 0,
      datos:  result.rows[0] || null
    });
  } catch (error){
    return res.status(500).json({ error: 'Error al verificar posición' });
  }
});

router.get('/existe/:item', async (req, res) => {
  try {
    const {item} = req.params;
    const result = await pool.query(
      'SELECT item, posicion, valor FROM deportes WHERE LOWER(item) = LOWER($1)',
      [item]
    );
    return res.json({
      existe: result.rows.length > 0,
      datos:  result.rows[0] || null
    });
  } catch (error) {
    console.error('Error al verificar existencia:', error.message);
    return res.status(500).json({ error: 'Error al verificar existencia' });
  }
});

router.post('/', async (req, res) => {
  try {
    const item     = req.body.item?.trim();
    const valor    = Number(req.body.valor);
    const posicion = Number(req.body.posicion);

    if (!item || Number.isNaN(valor) || Number.isNaN(posicion))
      return res.status(400).json({ error: 'Faltan datos o son inválidos' });

    if (valor <= 0 || posicion <= 0)
      return res.status(400).json({ error: 'Valor y posición deben ser mayores que 0' });

    const itemExistente = await pool.query(
      'SELECT 1 FROM deportes WHERE LOWER(item) = LOWER($1)', [item]
    );

    if (itemExistente.rows.length > 0)
      return res.status(409).json({ error: 'Ese deporte ya existe en la lista' });

    const result = await pool.query(
      'INSERT INTO deportes (item, posicion, valor) VALUES ($1, $2, $3) RETURNING item, posicion, valor',
      [item, posicion, valor]
    );

    return res.status(201).json({
      mensaje: 'Ítem registrado correctamente',
      datos: result.rows[0]
    });
  } catch (error) {
    console.error('Error al registrar ítem:', error.message);
    return res.status(500).json({ error: 'Error al registrar ítem' });
  }
});

module.exports = router;