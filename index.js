const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('node:fs');
let ejs = require('ejs');

app.use(express.json()); // for parsing application/json

const { DatabaseSync } = require('node:sqlite');
const database = new DatabaseSync('database.db');

// Variable en mémoire pour stocker les dates des vacances scolaires
let vacancesScolaires = [];

async function chargerVacancesScolaires() {
    try {
        const res = await fetch('https://data.education.gouv.fr/api/explore/v2.0/catalog/datasets/fr-en-calendrier-scolaire/exports/json');
        if (res.ok) {
            const data = await res.json();
            vacancesScolaires = data
                .filter(d => (d.zones === 'Zone A' || d.zones === 'Toutes zones' || !d.zones) && d.population !== 'Enseignants')
                .map(d => {
                    const startD = new Date(d.start_date);
                    const endD = new Date(d.end_date);
                    return {
                        description: d.description,
                        start: startD.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }),
                        end: endD.toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }),
                        zones: d.zones,
                        annee_scolaire: d.annee_scolaire
                    };
                });
            console.log(`Vacances scolaires chargées depuis l'API de l'Éducation Nationale (${vacancesScolaires.length} périodes).`);
        }
    } catch (err) {
        console.warn(`Erreur lors du chargement des vacances depuis l'API v2.0: ${err.message}`);
    }

    if (vacancesScolaires.length === 0) {
        try {
            const res = await fetch('https://fr.ftp.opendatasoft.com/openscol/fr-en-calendrier-scolaire/Zone-A.ics');
            if (res.ok) {
                const icsText = await res.text();
                const lines = icsText.split(/\r?\n/);
                let curEvent = null;
                for (const line of lines) {
                    if (line.startsWith('BEGIN:VEVENT')) {
                        curEvent = {};
                    } else if (line.startsWith('END:VEVENT')) {
                        if (curEvent && curEvent.start && curEvent.end) {
                            const formatD = (s) => s.length === 8 ? `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}` : s;
                            vacancesScolaires.push({
                                description: curEvent.summary || curEvent.description || 'Vacances',
                                start: formatD(curEvent.start),
                                end: formatD(curEvent.end),
                                zones: 'Zone A'
                            });
                        }
                        curEvent = null;
                    } else if (curEvent) {
                        if (line.startsWith('DTSTART;VALUE=DATE:') || line.startsWith('DTSTART:')) {
                            curEvent.start = line.split(':')[1].trim();
                        } else if (line.startsWith('DTEND;VALUE=DATE:') || line.startsWith('DTEND:')) {
                            curEvent.end = line.split(':')[1].trim();
                        } else if (line.startsWith('SUMMARY:')) {
                            curEvent.summary = line.replace('SUMMARY:', '').trim();
                        } else if (line.startsWith('DESCRIPTION:')) {
                            curEvent.description = line.replace('DESCRIPTION:', '').trim();
                        }
                    }
                }
                console.log(`Vacances scolaires chargées depuis le fichier ICS (${vacancesScolaires.length} périodes).`);
            }
        } catch (err) {
            console.error(`Erreur lors du chargement des vacances depuis le fichier ICS: ${err.message}`);
        }
    }
}

// Chargement des vacances scolaires au démarrage du serveur
chargerVacancesScolaires();

// Création de base si inexistante
fs.readFile("bdd.sql", "utf-8", (err, data) => {
    if (err) throw err;
    database.exec(data);
});



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/vendor/calendarjs', express.static(path.join(__dirname, 'node_modules/@calendarjs/ce/dist')));
app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.get('/', async (req, res) => {
    try {
        const [calendrierRes, matieresRes, groupesRes] = await Promise.all([
            fetch("http://localhost:3000/calendrier"),
            fetch("http://localhost:3000/matieres"),
            fetch("http://localhost:3000/groupes")

        ]);

        const calendrier = await calendrierRes.json();
        const matieres = await matieresRes.json();
        const groupes = await groupesRes.json();

        res.render('index', {
            data_calendrier: calendrier,
            data_matiere: matieres,
            data_groupes: groupes,
            data_vacances: vacancesScolaires
        });

    } catch (err) {

        res.status(500).send(err);
    }
});

app.get('/try', (req, res) => {
    res.render('try');
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
    const query = database.prepare('SELECT id, groupe FROM groupes;');
    res.send(query.all());
});


app.get('/calendrier', (req, res) => {
    //console.log(req.query);
    const query = database.prepare('SELECT cours.id, cours.id_matiere, cours.id_groupe, cours.semaine_a, cours.semaine_b, cours.date, cours.debut, cours.fin, cours.prof, cours.courriel, matieres.matiere, groupes.groupe FROM Cours JOIN matieres ON matieres.id = cours.id_matiere JOIN groupes ON groupes.id = cours.id_groupe;');
    res.send(query.all());
});

app.get('/vacances', (req, res) => {
    res.json(vacancesScolaires);
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
...
*/