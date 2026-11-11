let vacancesData = [];
let obj = [];
const arr = [];
let schedule = null;
let currentSelectedEvent = null;

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

function estEnVacances(dateStr) {
    if (!dateStr || !vacancesData || !Array.isArray(vacancesData) || vacancesData.length === 0) return false;
    for (let i = 0; i < vacancesData.length; i++) {
        const h = vacancesData[i];
        if (h.start && h.end) {
            if (h.start === h.end) {
                if (dateStr === h.start) return true;
            } else {
                if (dateStr >= h.start && dateStr < h.end) {
                    return true;
                }
            }
        }
    }
    return false;
}

window.estEnVacances = estEnVacances;
window.vacancesData = vacancesData;

function showEventDetails(eventData) {
    if (!eventData) return;
    currentSelectedEvent = eventData;

    const alertesEl = document.getElementById('eventDetailsAlertes');
    if (alertesEl) {
        alertesEl.innerHTML = '';
    }

    document.getElementById('eventMatiere').textContent = eventData.matiere || '';
    document.getElementById('eventGroupe').textContent = eventData.groupe || '';
    document.getElementById('eventProf').textContent = eventData.prof || '';
    // document.getElementById('eventCourriel').textContent = eventData.courriel || '';
    document.getElementById('eventDate').textContent = eventData.date || '';
    document.getElementById('eventHoraires').textContent = `${eventData.start || eventData.debut || ''} - ${eventData.end || eventData.fin || ''}`;

    let frequence = 'Une seule fois';
    const isSemaineA = eventData.semaine_a === 1 || eventData.semaine_a === '1' || eventData.semaine_a === true || eventData.semaine_a === 'true';
    const isSemaineB = eventData.semaine_b === 1 || eventData.semaine_b === '1' || eventData.semaine_b === true || eventData.semaine_b === 'true';

    if (isSemaineA && isSemaineB) {
        frequence = 'Régulier (Toutes les semaines)';
    } else if (isSemaineA) {
        frequence = 'Régulier (Semaine A)';
    } else if (isSemaineB) {
        frequence = 'Régulier (Semaine B)';
    }
    document.getElementById('eventFrequence').textContent = frequence;

    const eventModalEl = document.getElementById('eventDetailsModal');
    if (eventModalEl) {
        const modal = bootstrap.Modal.getInstance(eventModalEl) || bootstrap.Modal.getOrCreateInstance(eventModalEl);
        modal.show();
    }
}

function genererEvenements(element) {
    if (!element) return [];
    const isSemaineA = element.semaine_a === 1 || element.semaine_a === '1' || element.semaine_a === true || element.semaine_a === 'true' || element.semaineA === true || element.semaineA === 'true' || element.semaineA === 1 || element.semaineA === '1';
    const isSemaineB = element.semaine_b === 1 || element.semaine_b === '1' || element.semaine_b === true || element.semaine_b === 'true' || element.semaineB === true || element.semaineB === 'true' || element.semaineB === 1 || element.semaineB === '1';
    const isRecurrent = isSemaineA || isSemaineB;

    let matiere = element.matiere || '';
    let groupe = element.groupe || '';
    const prof = element.prof || element.nom || '';
    // const courriel = element.courriel || element.email || '';
    const courriel = '';
    const date = element.date || '';
    const debut = element.debut || element.start || element.timeStart || '';
    const fin = element.fin || element.end || element.timeEnd || '';

    // Si l'événement vient de la base de données, il contient id_matiere et id_groupe (les IDs)
    // ainsi que matiere et groupe (les noms déjà résolus par le JOIN SQL).
    // Si l'événement vient du formulaire, matiere et groupe sont déjà les noms.
    // On convertit uniquement si on a un ID pur et pas encore le nom.
    const matieresSelect = document.getElementById('matieres');
    if (matieresSelect && element.id_matiere && !element.matiere) {
        for (let i = 0; i < matieresSelect.options.length; i++) {
            if (matieresSelect.options[i].value === String(element.id_matiere)) {
                matiere = matieresSelect.options[i].text.trim();
                break;
            }
        }
    }

    const groupesSelect = document.getElementById('groupes');
    if (groupesSelect && element.id_groupe && !element.groupe) {
        for (let i = 0; i < groupesSelect.options.length; i++) {
            if (groupesSelect.options[i].value === String(element.id_groupe)) {
                groupe = groupesSelect.options[i].text.trim();
                break;
            }
        }
    }

    const title = matiere && groupe ? `${matiere} (${groupe})` : (matiere || groupe || element.title || 'Cours');
    const result = [];
    const courseId = element.id || element.cours_id || null;

    if (!isRecurrent) {
        if (!estEnVacances(date)) {
            result.push({
                id: courseId,
                cours_id: courseId,
                guid: String(element.guid || (courseId ? `cours_${courseId}` : ('evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)))),
                title: title,
                description: prof,
                date: date,
                start: debut,
                end: fin,
                color: element.color || '#3498db',
                matiere: matiere,
                groupe: groupe,
                prof: prof,
                courriel: courriel,
                debut: debut,
                fin: fin,
                semaine_a: isSemaineA,
                semaine_b: isSemaineB
            });
        }
    } else {
        const [y, m, d] = date.split('-').map(Number);
        const origDate = new Date(y, m - 1, d, 12, 0, 0);
        const targetWeekday = origDate.getDay();

        const startYear = (m >= 7) ? y : y - 1;
        const sept1 = new Date(startYear, 8, 1, 12, 0, 0);
        const sept1Day = sept1.getDay();
        const sept1Diff = (sept1Day === 0 ? -6 : 1) - sept1Day;
        const mondaySept1 = new Date(startYear, 8, 1 + sept1Diff, 12, 0, 0);

        const startDate = new Date(startYear, 8, 1, 12, 0, 0);
        const endDate = new Date(startYear + 1, 5, 30, 12, 0, 0);

        let cur = new Date(startDate);
        const baseGuid = element.guid || (courseId ? `cours_${courseId}` : ('evt_' + Date.now()));
        while (cur <= endDate) {
            if (cur.getDay() === targetWeekday) {
                const curDay = cur.getDay();
                const curDiff = (curDay === 0 ? -6 : 1) - curDay;
                const mondayCur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + curDiff, 12, 0, 0);
                const diffWeeks = Math.round((mondayCur.getTime() - mondaySept1.getTime()) / (7 * 24 * 3600 * 1000));
                const isWeekA = (diffWeeks % 2 === 0);
                const isWeekB = !isWeekA;

                if ((isWeekA && isSemaineA) || (isWeekB && isSemaineB)) {
                    const curY = cur.getFullYear();
                    const curM = String(cur.getMonth() + 1).padStart(2, '0');
                    const curD = String(cur.getDate()).padStart(2, '0');
                    const dateStr = `${curY}-${curM}-${curD}`;

                    if (!estEnVacances(dateStr)) {
                        result.push({
                            id: courseId,
                            cours_id: courseId,
                            guid: `${baseGuid}_${dateStr}`,
                            title: title,
                            description: prof,
                            date: dateStr,
                            start: debut,
                            end: fin,
                            color: element.color || '#3498db',
                            matiere: matiere,
                            groupe: groupe,
                            prof: prof,
                            courriel: courriel,
                            debut: debut,
                            fin: fin,
                            semaine_a: isSemaineA,
                            semaine_b: isSemaineB
                        });
                    }
                }
            }
            cur.setDate(cur.getDate() + 1);
        }
    }
    return result;
}

function afficherConfirmationSuppression() {
    if (!currentSelectedEvent) return;

    const prof = currentSelectedEvent.prof || currentSelectedEvent.nom || 'Un enseignant';
    const isSemaineA = currentSelectedEvent.semaine_a === 1 || currentSelectedEvent.semaine_a === '1' || currentSelectedEvent.semaine_a === true || currentSelectedEvent.semaine_a === 'true';
    const isSemaineB = currentSelectedEvent.semaine_b === 1 || currentSelectedEvent.semaine_b === '1' || currentSelectedEvent.semaine_b === true || currentSelectedEvent.semaine_b === 'true';
    const estRegulier = isSemaineA || isSemaineB;

    let message = `Vous allez supprimer un cours en classe ouverte. Merci de ne supprimer que les événements vous concernant, et non ceux de vos collègues. Ce cours appartient à ${prof}. Supprimer ?`;

    if (estRegulier) {
        message += `<br><br>Cela va supprimer également toutes les occurences hebdomadaires.`;
    }

    const deleteConfirmMessageEl = document.getElementById('deleteConfirmMessage');
    if (deleteConfirmMessageEl) {
        deleteConfirmMessageEl.innerHTML = message;
    }

    // Fermer la modale de détail avant d'ouvrir la modale de confirmation
    // pour éviter le problème de backdrop Bootstrap avec les modales empilées
    const eventModalEl = document.getElementById('eventDetailsModal');
    if (eventModalEl) {
        const eventModal = bootstrap.Modal.getInstance(eventModalEl) || bootstrap.Modal.getOrCreateInstance(eventModalEl);
        eventModal.hide();
    }

    // Ouvrir la modale de confirmation après un court délai pour laisser le temps à la modale de détail de se fermer
    setTimeout(() => {
        const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
        if (deleteConfirmModalEl) {
            const modal = bootstrap.Modal.getInstance(deleteConfirmModalEl) || bootstrap.Modal.getOrCreateInstance(deleteConfirmModalEl);
            modal.show();
        }
    }, 300);
}

async function executerSuppression() {
    if (!currentSelectedEvent) return;

    const eventId = currentSelectedEvent.id || currentSelectedEvent.cours_id;
    const eventGuid = currentSelectedEvent.guid;

    try {
        if (eventId) {
            const res = await fetch('/supprimer', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: eventId })
            });

            if (!res.ok) {
                const txt = await res.text();
                const alertesEl = document.getElementById('eventDetailsAlertes');
                if (alertesEl) {
                    alertesEl.innerHTML = `
                        <div class="alert alert-danger alert-dismissible fade show" role="alert">
                            <span>${txt || "Erreur lors de la suppression."}</span>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    `;
                } else {
                    alert(txt || "Erreur lors de la suppression.");
                }
                return;
            }
        }

        // Supprimer toutes les occurrences associées du tableau local et du calendrier
        const guidsToDelete = [];

        // Pour un événement récurrent, le guid est de la forme "cours_X_YYYY-MM-DD"
        // Pour un événement ponctuel, le guid est "cours_X"
        // On utilise eventId (cours_id) comme critère principal pour trouver toutes les occurrences
        if (eventId) {
            for (let i = arr.length - 1; i >= 0; i--) {
                const item = arr[i];
                const itemCourseId = item.id || item.cours_id;
                if (itemCourseId && String(itemCourseId) === String(eventId)) {
                    guidsToDelete.push(item.guid);
                    arr.splice(i, 1);
                }
            }
        } else if (eventGuid) {
            // Fallback: si pas d'eventId, on utilise le guid
            const baseGuid = eventGuid.includes('_') ? eventGuid.substring(0, eventGuid.lastIndexOf('_')) : eventGuid;
            for (let i = arr.length - 1; i >= 0; i--) {
                const item = arr[i];
                if (String(item.guid) === String(eventGuid) || String(item.guid).startsWith(baseGuid + '_')) {
                    guidsToDelete.push(item.guid);
                    arr.splice(i, 1);
                }
            }
        }

        if (schedule && guidsToDelete.length > 0) {
            if (typeof schedule.deleteEvents === 'function') {
                schedule.deleteEvents(guidsToDelete);
            }
        }

        // Fermer les modales
        const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
        if (deleteConfirmModalEl) {
            const modal = bootstrap.Modal.getInstance(deleteConfirmModalEl) || bootstrap.Modal.getOrCreateInstance(deleteConfirmModalEl);
            if (modal) {
                modal.hide();
            }
        }

        const eventModalEl = document.getElementById('eventDetailsModal');
        if (eventModalEl) {
            const modal = bootstrap.Modal.getInstance(eventModalEl) || bootstrap.Modal.getOrCreateInstance(eventModalEl);
            if (modal) {
                modal.hide();
            }
        }
        currentSelectedEvent = null;
    } catch (err) {
        console.error("Erreur lors de la suppression de l'événement:", err);
        const alertesEl = document.getElementById('eventDetailsAlertes');
        if (alertesEl) {
            alertesEl.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <span>Impossible de joindre le serveur pour supprimer l'événement.</span>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
        }
    }
}

function ajouterEvenementCalendrier(eventData) {
    if (!eventData) return;
    const items = genererEvenements(eventData);
    if (items.length > 0) {
        if (typeof arr !== 'undefined' && Array.isArray(arr)) {
            arr.push(...items);
        }
        if (window.schedule && typeof window.schedule.addEvents === 'function') {
            window.schedule.addEvents(items);
        }
    }
    return items;
}

window.ajouterEvenementCalendrier = ajouterEvenementCalendrier;
window.ajouterEvenement = ajouterEvenementCalendrier;
window.addEventToCalendar = ajouterEvenementCalendrier;

function updateNavigationInfo() {
    if (!schedule) return;
    const dateStr = schedule.value || new Date().toISOString().substring(0, 10);
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(y, m - 1, d + diff, 12, 0, 0);
    const friday = new Date(y, m - 1, d + diff + 4, 12, 0, 0);

    const startYear = (monday.getMonth() + 1 >= 7) ? monday.getFullYear() : monday.getFullYear() - 1;
    const sept1 = new Date(startYear, 8, 1, 12, 0, 0);
    const sept1Day = sept1.getDay();
    const sept1Diff = (sept1Day === 0 ? -6 : 1) - sept1Day;
    const mondaySept1 = new Date(startYear, 8, 1 + sept1Diff, 12, 0, 0);

    const diffWeeks = Math.round((monday.getTime() - mondaySept1.getTime()) / (7 * 24 * 3600 * 1000));
    const isWeekA = (diffWeeks % 2 === 0);
    const typeSemaine = isWeekA ? 'Semaine A' : 'Semaine B';

    const labelMonday = monday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    const labelFriday = friday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

    const weekLabelEl = document.getElementById('weekLabel');
    const weekTypeBadgeEl = document.getElementById('weekTypeBadge');
    if (weekLabelEl) {
        weekLabelEl.textContent = `Semaine du ${labelMonday} au ${labelFriday}`;
    }
    if (weekTypeBadgeEl) {
        weekTypeBadgeEl.textContent = typeSemaine;
        weekTypeBadgeEl.className = isWeekA ? 'badge bg-primary fs-6' : 'badge bg-success fs-6';
    }
}

async function initApp() {
    try {
        const [matieresRes, groupesRes, vacancesRes, calendrierRes] = await Promise.all([
            fetch('/matieres').then(r => r.json()),
            fetch('/groupes').then(r => r.json()),
            fetch('/vacances').then(r => r.json()),
            fetch('/calendrier').then(r => r.json())
        ]);

        // Remplir la sélection des matières
        const matieresSelect = document.getElementById('matieres');
        if (matieresSelect && Array.isArray(matieresRes)) {
            matieresRes.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.matiere;
                matieresSelect.appendChild(opt);
            });
        }

        // Remplir la sélection des groupes
        const groupesSelect = document.getElementById('groupes');
        if (groupesSelect && Array.isArray(groupesRes)) {
            groupesRes.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.id;
                opt.textContent = g.groupe;
                groupesSelect.appendChild(opt);
            });
        }

        // Vacances scolaires
        vacancesData = Array.isArray(vacancesRes) ? vacancesRes : [];
        window.vacancesData = vacancesData;

        // Événements du calendrier
        obj = Array.isArray(calendrierRes) ? calendrierRes : [];
        for (let index = 0; index < obj.length; index++) {
            const element = obj[index];
            arr.push(...genererEvenements(element));
        }

        // Instanciation de Schedule
        const ScheduleConstructor = (typeof calendarjs !== 'undefined' && calendarjs.Schedule) ? calendarjs.Schedule : window.Schedule;
        if (ScheduleConstructor && document.getElementById('schedule')) {
            schedule = ScheduleConstructor(document.getElementById('schedule'), {
                type: 'weekdays',
                weekly: false,
                validRange: ['08:00', '18:00'],
                overlap: true,
                data: arr,
                oncreate: function(self, events, e) {
                    if (e && events && events.length > 0) {
                        const newEvent = events[0];
                        const dateInput = document.getElementById('date');
                        const debutInput = document.getElementById('heureDebut');
                        const finInput = document.getElementById('heureFin');

                        if (dateInput && newEvent.date) {
                            dateInput.value = newEvent.date.substring(0, 10);
                        }
                        if (debutInput && newEvent.start) {
                            debutInput.value = newEvent.start;
                        }
                        if (finInput && newEvent.end) {
                            finInput.value = newEvent.end;
                        }

                        // Supprimer l'élément temporaire pour garder la vue synchronisée avec la base
                        self.deleteEvents(newEvent);

                        const modalElement = document.getElementById('exampleModal');
                        if (modalElement) {
                            const modal = bootstrap.Modal.getInstance(modalElement) || bootstrap.Modal.getOrCreateInstance(modalElement);
                            modal.show();
                        }
                    }
                },
                ondblclick: function(self, event) {
                    if (event && (event.matiere || event.prof || event.groupe)) {
                        showEventDetails(event);
                    }
                }
            });

            window.schedule = schedule;
            updateNavigationInfo();
        }

    } catch (err) {
        console.error("Erreur lors de l'initialisation de l'application:", err);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    initApp();

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

    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnToday = document.getElementById('btnToday');

    if (btnPrev) {
        btnPrev.addEventListener('click', function () {
            if (schedule) {
                schedule.prev();
                updateNavigationInfo();
            }
        });
    }
    if (btnNext) {
        btnNext.addEventListener('click', function () {
            if (schedule) {
                schedule.next();
                updateNavigationInfo();
            }
        });
    }
    if (btnToday) {
        btnToday.addEventListener('click', function () {
            if (schedule) {
                schedule.today();
                updateNavigationInfo();
            }
        });
    }

    const scheduleEl = document.getElementById('schedule');
    if (scheduleEl) {
        scheduleEl.addEventListener('click', function (e) {
            const item = e.target.closest('.lm-schedule-item');
            if (!item) return;
            const eventData = item.event || arr.find((el) => String(el.guid) === String(item.id) || String(el.id) === String(item.id));
            if (eventData && (eventData.matiere || eventData.prof || eventData.groupe)) {
                showEventDetails(eventData);
            }
        });
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
            // const courriel = document.getElementById("courriel") ? document.getElementById("courriel").value : "";
            const courriel = "";
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
                    // email: courriel
                    email: ""
                })
            }).then(async (response) => {
                if (response.status === 200) {
                    let resData = null;
                    try {
                        resData = await response.json();
                    } catch (e) {}
                    const newId = resData && resData.id ? resData.id : null;

                    if (typeof ajouterEvenementCalendrier === 'function') {
                        ajouterEvenementCalendrier({
                            id: newId,
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

    const btnDeleteEvent = document.getElementById("btnDeleteEvent");
    if (btnDeleteEvent) {
        btnDeleteEvent.addEventListener("click", afficherConfirmationSuppression);
    }

    const btnConfirmDelete = document.getElementById("btnConfirmDelete");
    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener("click", executerSuppression);
    }
});
