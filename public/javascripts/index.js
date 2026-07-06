document.addEventListener("DOMContentLoaded", function () {
    function f() {
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
                alert(console.log(response.status))
                console.log(response)
            }

        })
    }
    function reguilereE() {
        //console.log("sa")
        //alert("VOus Avez Clicker Reguilere")
    }
    document.getElementById("reguliere").onclick = reguilereE;
    document.getElementById("nouveau").onclick = f;
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