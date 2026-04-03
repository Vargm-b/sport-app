const express = require("express");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

// conexión a supabase
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    ssl: { rejectUnauthorized: false },
});

// inicializar servidor y tabla
async function iniciar() {
    try {
        await pool.query(`
      CREATE TABLE IF NOT EXISTS deportes(
        item VARCHAR(50) PRIMARY KEY,
        posicion INTEGER UNIQUE,
        valor INTEGER NOT NULL
      )
    `);

        console.log("Tabla deportes lista");

        app.listen(3000, () => {
            console.log("Servidor en http://localhost:3000");
        });
    } catch (err) {
        console.error("Error al iniciar:", err.message);
    }
}

iniciar();


// obtener deportes
app.get("/deportes", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT item AS nombre, valor AS costo, ROW_NUMBER() OVER (ORDER BY posicion) AS posicion FROM deportes ORDER BY posicion ASC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error al obtener deportes");
    }
});


// agregar deportes
app.post("/deportes", async (req, res) => {
    const { nombre, costo } = req.body;

    if (!nombre || isNaN(costo)) {
        return res.status(400).send("Datos inválidos");
    }

    try {
        // generar posición automática
        const posResult = await pool.query(
            "SELECT COALESCE(MAX(posicion), 0) + 1 AS next FROM deportes"
        );
        const posicion = posResult.rows[0].next;

        await pool.query(
            "INSERT INTO deportes(item, posicion, valor) VALUES($1, $2, $3)",
            [nombre, posicion, costo]
        );

        res.send("Agregado correctamente");
    } catch (err) {
        console.error(err.message);

        if (err.code === "23505") {
            res.status(400).send("Ese deporte ya existe");
        } else {
            res.status(500).send("Error al agregar");
        }
    }
});
