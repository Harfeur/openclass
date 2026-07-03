const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('node:fs');

app.use(express.json()); // for parsing application/json

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

app.get('/matieres', (req, res) => {
    //console.log(req.query);
    const query = database.prepare('SELECT id, matiere FROM matieres;');
    res.send(query.all());
});


app.get('/calendrier', (req, res) => {
    //console.log(req.query);
    const query = database.prepare('SELECT *, cours.id FROM matieres JOIN matieres ON matieres.id = cours.id_matiere JOIN groupes ON groupes.id = cours.id_matiere;');
    res.send(query.all());
});


app.post('/nouveau', (req, res) => {
    const id = database.prepare(`SELECT MAX(id) AS id FROM Cours;`, { returnArrays: true }).all()[0][0];
    // console.log(id);
    const data = req.body;
    const query = database.prepare(`INSERT INTO Cours (id_matiere, id_groupe, semaine_a, semaine_b, date, debut, fin, prof, courriel) VALUES (${data.matiere}, ${data.groupe}, ${data.semaineA}, ${data.semaineB}, '${data.date}', '${data.timeStart}', '${data.timeEnd}', '${data.nom}', '${data.email}');`);
    res.send(query.all());
});

/*
{
    "matiere": "Philosophie",
    "groupe": "TG4",
    "date": "03-07-2026",
    "timeStart": "08:00:00",
    "timeEnd": "10:00:00",
    "semaineA": "True",
    "semaineB": "False",
    "nom": "HASAN Daniel",
    "email": "daniel537hassan@gmail.com"
}

NE SUPPRIMER PAS SVP
*/