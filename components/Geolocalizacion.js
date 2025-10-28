import { navigate } from "../app.js";

export function showGeolocalizacion() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>📍 Geolocalización</h2>
      <div id="map" style="height: 400px; border-radius: 10px;"></div>
      <div class="actions">
        <button class="btn-primary" id="refreshMap">🔄 Actualizar ubicación</button>
        <button class="btn-secondary" id="back">⬅️ Volver</button>
      </div>
    </div>
  `;

  document.getElementById("back").onclick = () => navigate("user");
  document.getElementById("refreshMap").onclick = initMap;

  initMap();
}

function initMap() {
  const mapDiv = document.getElementById("map");
  mapDiv.innerHTML = "";
  if (!navigator.geolocation) {
    mapDiv.innerHTML = "<p>Tu navegador no soporta geolocalización.</p>";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const map = L.map("map").setView([latitude, longitude], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("📍 Estás aquí")
        .openPopup();
    },
    (err) => {
      mapDiv.innerHTML = `<p>Error: ${err.message}</p>`;
    }
  );
}
// ================================================   
// Geolocalizacion.js — Mapa de geolocalización usando Leaflet.js
// ================================================
