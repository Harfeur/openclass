const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('node:fs');
const cron = require('node-cron');

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



app.use(express.static('public'));
app.use('/vendor/lemonadejs', express.static(path.join(__dirname, 'node_modules/lemonadejs/dist')));
app.use('/vendor/calendarjs', express.static(path.join(__dirname, 'node_modules/@calendarjs/ce/dist')));
app.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

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
    // } else if (data.email === "") {
    //     res.status(400).send("La case E-Mail doit etre remplie")
    } else {
        // const query = database.prepare(`INSERT INTO Cours (id_matiere, id_groupe, semaine_a, semaine_b, date, debut, fin, prof, courriel) VALUES (${data.matiere}, ${data.groupe}, ${data.semaineA}, ${data.semaineB}, '${data.date}', '${data.timeStart}', '${data.timeEnd}', '${data.nom}', '${data.email}');`);
        const query = database.prepare(`INSERT INTO Cours (id_matiere, id_groupe, semaine_a, semaine_b, date, debut, fin, prof, courriel) VALUES (${data.matiere}, ${data.groupe}, ${data.semaineA}, ${data.semaineB}, '${data.date}', '${data.timeStart}', '${data.timeEnd}', '${data.nom}', NULL);`);
        const result = query.run();
        const insertedId = result ? result.lastInsertRowid : null;
        res.status(200).json({ id: insertedId, success: true });
    }
});

app.post('/supprimer', (req, res) => {
    const id = req.body && (req.body.id || req.body.cours_id);
    if (!id) {
        return res.status(400).send("ID du cours requis pour la suppression");
    }
    try {
        const query = database.prepare(`DELETE FROM Cours WHERE id = ?;`);
        query.run(id);
        res.status(200).json({ success: true, message: "Événement supprimé avec succès" });
    } catch (err) {
        console.error("Erreur suppression cours:", err);
        res.status(500).send("Erreur lors de la suppression du cours");
    }
});

app.delete('/cours/:id', (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).send("ID du cours requis pour la suppression");
    }
    try {
        const query = database.prepare(`DELETE FROM Cours WHERE id = ?;`);
        query.run(id);
        res.status(200).json({ success: true, message: "Événement supprimé avec succès" });
    } catch (err) {
        console.error("Erreur suppression cours:", err);
        res.status(500).send("Erreur lors de la suppression du cours");
    }
});


/*
...
*/

// Sauvegarde automatique de la base de données
const backupDir = path.join(__dirname, 'backup');
const MAX_BACKUPS = 5;
const dbPath = path.join(__dirname, 'database.db');

function sauvegarderBase() {
    // Créer le dossier backup s'il n'existe pas
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Générer le nom du fichier de sauvegarde avec la date du jour
    const now = new Date();
    const dateStr = now.getFullYear()
        + String(now.getMonth() + 1).padStart(2, '0')
        + String(now.getDate()).padStart(2, '0');
    const backupFileName = `database_backup_${dateStr}.db`;
    const backupFilePath = path.join(backupDir, backupFileName);

    try {
        // Copier la base de données
        fs.copyFileSync(dbPath, backupFilePath);
        console.log(`Sauvegarde créée : ${backupFileName}`);

        // Nettoyer les anciennes sauvegardes en gardant les 5 plus récentes
        const backups = fs.readdirSync(backupDir)
            .filter(file => file.startsWith('database_backup_') && file.endsWith('.db'))
            .sort() // tri alphabétique = chronologique grâce au format de nommage
            .reverse(); // les plus récentes en premier

        if (backups.length > MAX_BACKUPS) {
            const toDelete = backups.slice(MAX_BACKUPS);
            for (const oldBackup of toDelete) {
                fs.unlinkSync(path.join(backupDir, oldBackup));
                console.log(`Ancienne sauvegarde supprimée : ${oldBackup}`);
            }
        }
    } catch (err) {
        console.error(`Erreur lors de la sauvegarde : ${err.message}`);
    }
}

// Planifier la sauvegarde tous les jours à 4:00 du matin
cron.schedule('0 4 * * *', sauvegarderBase, {
    scheduled: true,
    timezone: 'Europe/Paris'
});

console.log('Sauvegarde automatique planifiée à 4:00 (heure de Paris).');