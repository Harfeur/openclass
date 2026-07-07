    function reguilereE(elt) {
    if (reguliere.checked) {
        console.log("Coché")
        reguliereOptions.style.display = ""
    } else {
        console.log("Décoché")
        reguliereOptions.style.display = "none"
    }
    // var option1 = document.createElement("div")
    // option1.className = "mb-3 form-check"
    // option1.innerHTML = `<input type="checkbox" class="form-check-input" id="semaineA" value="False"> <label class="form-check-label" for="semaineA">Semaine A</label>`
    // reguliereOptions.appendChild(option1)

    //console.log("sa")
    alert("Vous Avez Clicker Reguilere")
}

document.addEventListener("DOMContentLoaded", function () {
    function f(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const semaineA = document.getElementById('semaineA');
        const semaineB = document.getElementById('semaineB');
        const reguliere = document.getElementById('reguliere');
        console.log(semaineA.checked)
        console.log(reguliere.checked)



        fetch('http://localhost:3000/nouveau', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                matiere: 2,
                groupe: 4,
                semaineA: semaineA.checked,
                semaineB: semaineB.checked,
                date: "2026-07-03",
                timeStart: "08:00:00",
                timeEnd: "10:00:00",
                nom: name,
                email: "daniel537hassan@gmail.com"
            })
        }).then((response) => {
            if (response.status === 400) {
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