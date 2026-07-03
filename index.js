const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('node:fs');

const { DatabaseSync } = require('node:sqlite');
const database = new DatabaseSync('database.db');

// Création de base si inexistante
fs.readFile("bdd.sql", "utf-8", (err, data) => {
    if (err) throw err;
    database.exec(data);
});

app.use(express.static(path.resolve('./public')));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.get('/calendrier', (req, res) => {
    console.log(req.query);
    const query = database.prepare('SELECT * FROM Cours;');
    res.send(query.all());
});