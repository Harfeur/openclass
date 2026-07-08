function reguilereE() {
    const reguliere = document.getElementById("reguliere");
    const uneSeulFois = document.getElementById("uneSeeulFois");
    const reguliereOptions = document.getElementById("reguliereOptions");

    if (reguliere.checked) {
        console.log("Coché");
        reguliereOptions.style.display = "block";
    } else {
        console.log("Décoché");
        reguliereOptions.style.display = "none";
    }
}
document.addEventListener("DOMContentLoaded", function () {
    function f(e) {
        e.preventDefault();
        const matiere = document.getElementById('matieres').value;
        const groupe = document.getElementById('groupes').value;
        const date = document.getElementById('date').value;
        const heureDebut = document.getElementById('heureDebut').value;
        const heureFin = document.getElementById('heureFin').value;

        const reguliere = document.getElementById('reguliere');
        const semaineA = document.getElementById('semaineA');
        const semaineB = document.getElementById('semaineB');


        const nom = document.getElementById('nom').value;
        const courriel = document.getElementById('courriel').value;
        // console.log(semaineA.checked)
        // console.log(reguliere.checked)



        fetch('http://localhost:3000/nouveau', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                matiere: matiere,
                groupe: groupe,
                semaineA: semaineA.checked,
                semaineB: semaineB.checked,
                date: date,
                timeStart: heureDebut,
                timeEnd: heureFin,
                nom: nom,
                email: courriel
            })
        }).then((response) => {
            if (response.status === 400) {
                const modalElement = document.getElementById("exampleModal");
                const modal = bootstrap.Modal.getInstance(modalElement);

                if (modal) {
                    modal.hide();
                }
                var alertes = document.getElementById("alertes")
                var newElement = document.createElement("div")
                newElement.className = "alert alert-warning alert-dismissible fade show"
                newElement.role = "alert"
                response.text().then(txt => {
                    newElement.innerHTML = `${txt}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`
                    alertes.appendChild(newElement)
                })
            }

        })
    }
    document.getElementById("form_inscr").addEventListener("submit", f, true);
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