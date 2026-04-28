// ================== NOTIFICATIONS PANEL ==================
const panelBtn = document.getElementById("togglePanel");
const panel = document.getElementById("panel");
const closePanelBtn = document.getElementById("closePanel");

const notLoggedIn = document.getElementById("no-notification");
const loggedIn = document.getElementById("user-section");
const usernameDisplay = document.getElementById("usernameDisplay");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");


const notificationsList_clearing = document.getElementById('notifications-list');

// Simulation de connexion (à remplacer par vraie vérification session plus tard)
let isLoggedIn = false;        // Change en true pour tester l'état connecté
let currentUsername = "Clément";
let currentUserID = 1

// Ouvrir / Fermer le panneau
panelBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
    updatePanelState();
});

closePanelBtn.addEventListener("click", () => {
    panel.classList.remove("open");
});

// Mise à jour de l'affichage selon l'état de connexion
function updatePanelState() {
    if (isLoggedIn) {
        notLoggedIn.style.display = "none";
        loggedIn.style.display = "block";
        usernameDisplay.textContent = currentUsername;
    } else {
        notLoggedIn.style.display = "block";
        loggedIn.style.display = "none";

    }

    console.log("🔐 État du panneau mis à jour :", isLoggedIn ? "Connecté" : "Non connecté");
    console.log(loggedIn.style.display);
}

// Boutons
btnLogin.addEventListener("click", () => {
    // À remplacer par window.location = "login.php" quand tu auras la page
    // alert("Redirection vers la page de connexion (à implémenter)");
    // isLoggedIn = true;   // Pour tester
    // updatePanelState();
    // loadNotifications();
    window.location = "login.php"
});

btnLogout.addEventListener("click", () => {
    isLoggedIn = false;
    currentUsername = "";
    notificationsList_clearing.innerHTML = ""; 

    updatePanelState();
    alert("Vous avez été déconnecté.");
    panel.classList.remove("open");
    seenNotifications.clear();
    setTimeout(() =>  {
        location.reload();
    }, 500)
});

async function loadNotifications() {
    if (isLoggedIn) {
        try {
            const response = await fetch(`${SERVER_URL2}/api/notifications/history`);
            const data = await response.json();
            
            if (data.notifications) {
                Object.values(data.notifications).forEach(notif => {
                    const hasAdmin = notif.seen.some(user => user.username === currentUsername);
                    if (hasAdmin === false) {
                        console.log(notif.user.user_id, notif.user.username);
                        console.log(currentUsername, "test seen");
                        const notifElement = document.createElement('div');

                        notifElement.className = 'notification-item';
                        notifElement.dataset.type = notif.type || 'info';
                        notifElement.innerHTML = `
                            <small>${new Date(notif.timestamp).toLocaleTimeString('fr-FR')}</small>
                            <p>${notif.message}</p>
                        `;
                        notificationsList.appendChild(notifElement);

                        // Ajout dans la liste
                        if (notificationsList) {
                            notificationsList.prepend(notifElement);
                        }

                        seenNotifications.add(notif.id);
                        console.log(seenNotifications);
                        markAsSeen(notif.id, currentUserID, currentUsername)

                        // Masquer "Pas de notification"
                        if (noNotification) {
                            noNotification.style.display = 'none';
                        }

                        console.log("Notification affichée depuis l'historique:", notif.message, notif);
                    }
                    else {
                        seenNotifications.add(notif.id)
                    }
                });
                    
            }

        } catch (error) {
            console.warn("Impossible de charger l'historique :", error);
        }
    }
}

// Mise à jour initiale
updatePanelState();
