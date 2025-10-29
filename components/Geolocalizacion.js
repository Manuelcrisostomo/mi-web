// ================================================
// Geolocalizacion.js — Mapa con Leaflet
// ================================================
import { navigate } from "../app.js";

export function showGeolocalizacion() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <nav class="main-navbar">
      <button data-view="user">🏠 Menú Principal</button>
      <button data-view="devices">💡 Dispositivos</button>
      <button data-view="graficos">📊 Gráficos</button>
      <button data-view="usuarios">👥 Usuarios</button>
      <button class="logout">🚪 Cerrar Sesión</button>
    </nav>

    <div class="dashboard">
      <h2>📍 Geolocalización</h2>
      <div id="map" style="height:400px; border-radius:10px;"></div>
    </div>
  `;

  root.querySelectorAll(".main-navbar button[data-view]").forEach(btn =>
    btn.addEventListener("click", () => navigate(btn.dataset.view))
  );

  const map = L.map("map").setView([-33.45, -70.65], 13); // Santiago por defecto
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      L.marker([lat, lon]).addTo(map).bindPopup("📍 Estás aquí").openPopup();
      map.setView([lat, lon], 15);
    });
  }
}
