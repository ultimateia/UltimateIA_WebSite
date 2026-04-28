// ================== CONFIGURATION ==================
const SERVER_URL = "https://robot-live.onrender.com";

// ================== INITIALISATION CARTE ==================
const map = L.map('map', {
    zoomControl: true,
    attributionControl: true
}).setView([45.360433, 5.600352], 16);

L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap France / © OpenStreetMap contributors'
}).addTo(map);

let trajet = L.polyline([], { color: '#e74c3c', weight: 6, opacity: 0.9 }).addTo(map);
let robotMarker = L.marker([45.360433, 5.600352]).addTo(map);

const ORIGIN_POSITION = [45.360433, 5.600352];

let positions = [];
let hasReceivedPosition = false;

// ====================== RESET + SAUVEGARDE VIA PHP ======================
async function resetMap() {
    if (positions.length === 0) {
        console.log("Aucun trajet à sauvegarder");
        doReset();
        return;
    }

    console.log(`💾 Sauvegarde de ${positions.length} points via add-trajet.php...`);

    const trajetData = {
        duree_minutes: 0,                    // Tu pourras calculer plus tard
        distance_metres: 0,
        dechets_recuperes: 0,
        problemes_rencontres: "",
        commentaires: "Trajet sauvegardé automatiquement via Clear",
        trajet_data: positions               // Liste des [lat, lon]
    };

    try {
        const response = await fetch('add-trajet.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(trajetData)
        });

        const result = await response.json();

        if (result.status === "success") {
            console.log("✅ Trajet sauvegardé avec succès via PHP");
        } else {
            console.warn("⚠️ Erreur lors de la sauvegarde :", result.message);
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à add-trajet.php :", error);
    }

    // Reset de la carte après tentative de sauvegarde
    doReset();
}

// Fonction de reset pur (séparée pour plus de clarté)
function doReset() {
    positions = [];
    trajet.setLatLngs([]);
    robotMarker.setLatLng(ORIGIN_POSITION);
    map.flyTo(ORIGIN_POSITION, 16, { duration: 1.5 });
    
    hasReceivedPosition = false;
    robotMarker.closePopup();
    enableMapInteractions();
    
    console.log("🗑️ Carte réinitialisée");
}

// ====================== CHARGER HISTORIQUE ======================
async function loadHistory() {
    try {
        const response = await fetch(`${SERVER_URL}/api/positions/history`);
        const data = await response.json();
        if (data.positions && data.positions.length > 0) {
            positions = data.positions.map(p => [p.lat, p.lon]);
            trajet.setLatLngs(positions);
            const last = positions[positions.length - 1];
            robotMarker.setLatLng(last);
            map.flyTo(last, 17, { duration: 1.5 });
            hasReceivedPosition = true;
            disableMapInteractions();
        }
    } catch (error) {
        console.warn("Impossible de charger l'historique :", error);
    }
}

loadHistory();

// ====================== UPDATE POSITION ======================
function updateRobotPosition(lat, lon, data = {}) {
    const pos = [lat, lon];
    positions.push(pos);
    trajet.setLatLngs(positions);
    robotMarker.setLatLng(pos);

    if (!hasReceivedPosition) {
        map.flyTo(pos, 17, { duration: 1.5 });
        hasReceivedPosition = true;
        disableMapInteractions();
    } else {
        map.panTo(pos, { duration: 1.2 });
    }

    robotMarker.bindPopup(`
        <b>Robot en mouvement</b><br>
        Latitude : ${lat.toFixed(6)}<br>
        Longitude : ${lon.toFixed(6)}<br>
        ${data.vitesse ? `Vitesse : ${data.vitesse} km/h<br>` : ''}
        ${data.batterie ? `Batterie : ${data.batterie} %<br>` : ''}
        ${data.satellites ? `Satellites : ${data.satellites}` : ''}
    `).openPopup();
}

// ====================== SSE SIMPLE ======================
const eventSource = new EventSource(`${SERVER_URL}/api/position-stream`);

eventSource.onmessage = function(e) {
    const event = JSON.parse(e.data);
    
    if (event.type === "clear") {
        console.log("🧹 Signal clear reçu du serveur");
        resetMap();
        return;
    }
    
    if (event.type === "position" && event.data && event.data.lat && event.data.lon) {
        updateRobotPosition(event.data.lat, event.data.lon, event.data);
    }
};

eventSource.onerror = function() {
    console.warn("Erreur SSE");
};

// Ping Render
setInterval(() => {
    fetch(`${SERVER_URL}/ping`).catch(() => {});
}, 240000);

// ====================== INTERACTIONS ======================
function disableMapInteractions() {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    window.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
}

function enableMapInteractions() {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    window.removeEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); });
}