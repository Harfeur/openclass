const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('node:fs');
let ejs = require('ejs');

app.use(express.json()); // for parsing application/json

const { DatabaseSync } = require('node:sqlite');
const database = new DatabaseSync('database.db');

// Création de base si inexistante
fs.readFile("bdd.sql", "utf-8", (err, data) => {
    if (err) throw err;
    database.exec(data);
});


//app.use('/static', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'))


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/try', (req, res) => {
    const matieres = fetch("http://localhost:3000/matieres")
        .then(res => console.log(res.data))
    console.log("ok")
    const query = database.prepare('SELECT matiere FROM matieres;');
    //console.log(query.all());

    const data = {
        nom: "Daniel",
        db: query.all()

    }
    console.log(data.db)
    //console.log("a", query.all()[0])
    res.render('try', { data });


});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.get('/matieres', (req, res) => {
    //console.log(req.query);
    const query = database.prepare('SELECT id, matiere FROM matieres;');
    res.send(query.all());
});

app.get('/groupes', (req, res) => {
    //console.log(req.query);
    const query = database.prepare('SELECT id, group FROM groupes;');
    res.send(query.all());
});


app.get('/calendrier', (req, res) => {
    //console.log(req.query);
    const query = database.prepare('SELECT *, cours.id FROM Cours JOIN matieres ON matieres.id = cours.id_matiere JOIN groupes ON groupes.id = cours.id_matiere;');
    res.send(query.all());
});


app.post('/nouveau', (req, res) => {
    const id = database.prepare(`SELECT MAX(id) AS id FROM Cours;`, { returnArrays: true }).all()[0][0];
    // console.log(id);
    const data = req.body;
    if (data.matiere === "") {
        res.status(400).send("Selectioner une matière")
    } else if (data.groupe === "") {
        res.status(400).send("Selectioner une groupe")
    } else if (data.date === "") {
        res.status(400).send("Choisisez une date")
    } else if (data.timeStart === "") {
        res.status(400).send("Choisisez heure de debut")
    } else if (data.timeEnd === "") {
        res.status(400).send("Choisisez fin de heure")
    } else if (data.nom === "") {
        res.status(400).send("La case Nom doit etre remplie")
    } else if (data.email === "") {
        res.status(400).send("La case E-Mail doit etre remplie")
    } else {
        const query = database.prepare(`INSERT INTO Cours (id_matiere, id_groupe, semaine_a, semaine_b, date, debut, fin, prof, courriel) VALUES (${data.matiere}, ${data.groupe}, ${data.semaineA}, ${data.semaineB}, '${data.date}', '${data.timeStart}', '${data.timeEnd}', '${data.nom}', '${data.email}');`);
        res.send(query.all());
    }
});


/*
 if (data.nom === "") {
        res.status(400).send("La case Nom doit etre remplie")
    } else if (data.email === "") {
        res.status(400).send("La case EMAIL doit etre remplie")
    } else if (data.date === "") {
        res.status(400).send("La case Date doit etre remplie")
    } else if (data.timeStart === "") {
        res.status(400).send("La case Date Debut doit etre remplie")
    } else if (data.timeEnd === "") {
        res.status(400).send("La case Date Fin doit etre remplie")
    } else {
        const query = database.prepare(`INSERT INTO Cours (id_matiere, id_groupe, semaine_a, semaine_b, date, debut, fin, prof, courriel) VALUES (${data.matiere}, ${data.groupe}, ${data.semaineA}, ${data.semaineB}, '${data.date}', '${data.timeStart}', '${data.timeEnd}', '${data.nom}', '${data.email}');`);
        res.send(query.all());
    }*/
