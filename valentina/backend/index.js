// Importación de librerías
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Conexión a PostgreSQL en Supabase (El entorno común)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

// Mensaje de prueba para confirmar en la consola que conectó
pool.connect()
    .then(() => console.log(' Conexión exitosa a la base de datos grupal en Supabase'))
    .catch(err => console.error(' Error de conexión a la BD:', err.stack));

// Ruta POST
app.post('/api/registrar', async (req, res) => {
    // Las variables ya cumplen con el estándar camelCase
    const { item, posicion, valor } = req.body;

    try {
        // Verificar si el deporte ya existe en la tabla común
        const checkQuery = 'SELECT * FROM deportes WHERE LOWER(item) = LOWER($1)';
        const checkResult = await pool.query(checkQuery, [item]);

        if (checkResult.rows.length > 0) {
            return res.json({ 
                status: 'error', 
                mensaje: `El deporte '${item}' ya existe.` 
            });
        }

        // Inserción en la tabla común del grupo
        const insertQuery = 'INSERT INTO deportes (item, posicion, valor) VALUES ($1, $2, $3)';
        await pool.query(insertQuery, [item, posicion, valor]);

        return res.json({ 
            status: 'success', 
            mensaje: `Registro completado: ${item}` 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', mensaje: 'Error servidor' });
    }
});

// Ruta GET
app.get('/api/listar', async (req, res) => {
    try {
        // Consulta a la tabla común del grupo
        const result = await pool.query('SELECT item, posicion, valor FROM deportes ORDER BY posicion ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', mensaje: 'Error al listar' });
    }
});

app.listen(3000, () => {
    console.log('Servidor backend ejecutándose en http://localhost:3000');
});
