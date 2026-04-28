// import currentUsername from "./notifications.js";

// ================== NOTIFICATIONS EN TEMPS RÉEL ==================
const SERVER_URL2 = "https://robot-live.onrender.com";

const notificationsList = document.getElementById('notifications-list');
const noNotification = document.getElementById('no-notification');
const loggedInCheck = document.getElementById("user-section");

// Variables pour éviter les doublons
const seenNotifications = new Set();

// Connexion au flux SSE des notifications
const notifSource = new EventSource(`${SERVER_URL2}/api/notifications-stream`);

notifSource.onmessage = async function(e) {
    setTimeout(() => {
        if (loggedInCheck.style.display !== "block") {
            console.log("Utilisateur non connecté, notification ignorée.");
            return;
        }
        try {
            const notif = JSON.parse(e.data);
            
            // Ignorer les messages vides ou "no_notification"
            if (!notif.message && notif.type !== "no_notification") return;

            if (notif.type === "no_notification") {
                console.log("🧹 Signal clear reçu du serveur");
                notificationsList.innerHTML = "";
                return;
            }

            console.log(seenNotifications, notif.id);
            if (seenNotifications.has(notif.id)) {
                console.log("Notification déjà vue, ignorée :", notif.message);
                return;
            }
            else {
                seenNotifications.add(notif.id);

                // Création de la notification
                const notifElement = document.createElement('div');
                notifElement.className = 'notification-item';
                notifElement.dataset.type = notif.type || 'info';
                notifElement.innerHTML = `
                    <small>${new Date(notif.timestamp).toLocaleTimeString('fr-FR')}</small>
                    <p>${notif.message}</p>
                `;
                
                // Ajout dans la liste
                if (notificationsList) {
                    notificationsList.prepend(notifElement);
                }

                // Masquer "Pas de notification"
                if (noNotification) {
                    noNotification.style.display = 'none';
                }

                markAsSeen(notif.id, currentUserID, currentUsername);

                console.log("Notification affichée :", notif.message);
            }

            

        } catch (err) {
            console.error("Erreur parsing notification :", err);
        }
        console.log("Waited for 3 seconds");
    }, 5000);
};

notifSource.onerror = function() {
    console.warn("Erreur sur le flux notifications");
};

// Exemple : Envoyer une notification de test
function sendTestNotification(message) {
    fetch(`${SERVER_URL2}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: "info",
            message: message
        })
    });
}

function addToHistory(notif) {
    fetch(`${SERVER_URL2}/api/notification/add-to-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            notif: notif
        })
    });
}

async function markAsSeen(notificationId, userId, username) {
    console.log(`Marquer notification ${notificationId} comme vue pour l'utilisateur ${username} (ID: ${userId})`);
    try {
        const response = await fetch(`${SERVER_URL2}/api/notifications/${notificationId}/seen`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                user_id: userId,
                username: username
            })
        });

        const result = await response.json();
        console.log("✅ Notification marquée comme vue :", result);
        
    } catch (error) {
        console.error("Erreur lors du mark as seen :", error);
    }
}