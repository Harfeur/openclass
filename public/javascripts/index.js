function reguilereE() {
    const reguliere = document.getElementById("reguliere");
    const reguliereOptions = document.getElementById("reguliereOptions");
    const semaineA = document.getElementById("semaineA");
    const semaineB = document.getElementById("semaineB");

    if (reguliere && reguliere.checked) {
        if (reguliereOptions) {
            reguliereOptions.style.display = "block";
        }
    } else {
        if (reguliereOptions) {
            reguliereOptions.style.display = "none";
        }
        if (semaineA) {
            semaineA.checked = false;
        }
        if (semaineB) {
            semaineB.checked = false;
        }
    }
}

function afficherAlerte(message, type = "danger") {
    const alertes = document.getElementById("alertes");
    if (!alertes) return;
    alertes.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <span>${message}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

function effacerAlertes() {
    const alertes = document.getElementById("alertes");
    if (alertes) {
        alertes.innerHTML = "";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const modalElement = document.getElementById("exampleModal");
    if (modalElement) {
        modalElement.addEventListener("hidden.bs.modal", function () {
            effacerAlertes();
        });
    }

    const uneSeuleFois = document.getElementById("uneSeeulFois");
    const reguliere = document.getElementById("reguliere");
    if (uneSeuleFois) {
        uneSeuleFois.addEventListener("change", reguilereE);
    }
    if (reguliere) {
        reguliere.addEventListener("change", reguilereE);
    }

    const formInscr = document.getElementById("form_inscr");
    if (formInscr) {
        formInscr.addEventListener("submit", function (e) {
            e.preventDefault();
            effacerAlertes();

            const reguliere = document.getElementById("reguliere");
            const semaineA = document.getElementById("semaineA");
            const semaineB = document.getElementById("semaineB");

            if (reguliere && reguliere.checked) {
                const checkedA = semaineA && semaineA.checked;
                const checkedB = semaineB && semaineB.checked;

                if (!checkedA && !checkedB) {
                    afficherAlerte("Veuillez cocher Semaine A et / ou Semaine B pour une visite régulière.", "danger");
                    return;
                }
            }

            const matieresSelect = document.getElementById("matieres");
            const groupesSelect = document.getElementById("groupes");
            const matiere = matieresSelect ? matieresSelect.value : "";
            const matiereText = (matieresSelect && matieresSelect.selectedIndex >= 0) ? matieresSelect.options[matieresSelect.selectedIndex].text.trim() : "";
            const groupe = groupesSelect ? groupesSelect.value : "";
            const groupeText = (groupesSelect && groupesSelect.selectedIndex >= 0) ? groupesSelect.options[groupesSelect.selectedIndex].text.trim() : "";
            const date = document.getElementById("date") ? document.getElementById("date").value : "";
            const heureDebut = document.getElementById("heureDebut") ? document.getElementById("heureDebut").value : "";
            const heureFin = document.getElementById("heureFin") ? document.getElementById("heureFin").value : "";
            const nom = document.getElementById("nom") ? document.getElementById("nom").value : "";
            const courriel = document.getElementById("courriel") ? document.getElementById("courriel").value : "";
            const isSemaineA = (reguliere && reguliere.checked && semaineA) ? semaineA.checked : false;
            const isSemaineB = (reguliere && reguliere.checked && semaineB) ? semaineB.checked : false;

            fetch('/nouveau', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    matiere: matiere,
                    groupe: groupe,
                    semaineA: isSemaineA,
                    semaineB: isSemaineB,
                    date: date,
                    timeStart: heureDebut,
                    timeEnd: heureFin,
                    nom: nom,
                    email: courriel
                })
            }).then((response) => {
                if (response.status === 200) {
                    if (typeof ajouterEvenementCalendrier === 'function') {
                        ajouterEvenementCalendrier({
                            matiere: matiereText || matiere,
                            groupe: groupeText || groupe,
                            date: date,
                            debut: heureDebut,
                            fin: heureFin,
                            prof: nom,
                            courriel: courriel,
                            semaine_a: isSemaineA,
                            semaine_b: isSemaineB
                        });
                    } else if (typeof window !== 'undefined' && typeof window.ajouterEvenementCalendrier === 'function') {
                        window.ajouterEvenementCalendrier({
                            matiere: matiereText || matiere,
                            groupe: groupeText || groupe,
                            date: date,
                            debut: heureDebut,
                            fin: heureFin,
                            prof: nom,
                            courriel: courriel,
                            semaine_a: isSemaineA,
                            semaine_b: isSemaineB
                        });
                    }
                    formInscr.reset();
                    const reguliereOptions = document.getElementById("reguliereOptions");
                    if (reguliereOptions) {
                        reguliereOptions.style.display = "none";
                    }
                    effacerAlertes();
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement) || bootstrap.Modal.getOrCreateInstance(modalElement);
                        if (modal) {
                            modal.hide();
                        }
                    }
                } else {
                    response.text().then((txt) => {
                        const message = txt || "Une erreur est survenue lors de l'enregistrement.";
                        afficherAlerte(message, "danger");
                    }).catch(() => {
                        afficherAlerte("Une erreur est survenue lors de l'enregistrement.", "danger");
                    });
                }
            }).catch((err) => {
                afficherAlerte("Impossible de contacter le serveur. Veuillez réessayer.", "danger");
            });
        }, true);
    }
});

/*
<div class="reguliereOptions">
</div>

<div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="semaineA" value="False">
    <label class="form-check-label" for="semaineA">Semaine A</label>
</div>
<div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="semaineB">
    <label class="form-check-label" for="semaineB">Semaine B</label>
</div>

document.addEventListener("DOMContentLoaded", function () {
    function f() {

        const name = document.getElementById('name').value;
        if (name.length == 0) {
            alert("La case Nom ne peut pas etre vide!")
        } else {
            fetch('http://localhost:3000/nouveau', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    matiere: 2,
                    groupe: 4,
                    semaineA: true,
                    semaineB: false,
                    date: "2026-07-03",
                    timeStart: "08:00:00",
                    timeEnd: "10:00:00",
                    nom: name,
                    email: "daniel537hassan@gmail.com"
                })
            }).then((response) => {
                console.log(response)
            });
            console.log(name);

        };
    }
    document.getElementById("nouveau").onclick = f;
});





*/