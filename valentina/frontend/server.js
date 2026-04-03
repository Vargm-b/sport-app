const express = require('express');
const path = require('path');

const app = express();

// Servir archivos del frontend con headers de no-caché
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

app.use(express.static(__dirname));

app.listen(8080, () => {
    console.log('Frontend servidor en http://localhost:8080');
});
