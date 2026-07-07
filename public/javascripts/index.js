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
    function reguilereE() {
        //console.log("sa")
        //alert("VOus Avez Clicker Reguilere")
    }
    document.getElementById("reguliere").onclick = reguilereE;
    document.getElementById("form_inscr").addEventListener("submit", f, true);
});

/*

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