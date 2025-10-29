// ================================================
// Geolocalizacion.js — Mapa con Leaflet + ubicación detallada
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

    <div class="dashboard container mt-3">
      <h2>📍 Geolocalización</h2>
      <div id="map" style="height:400px; border-radius:10px;"></div>

      <div class="mt-3">
        <button id="btnGetLocation" class="btn btn-outline-primary">📡 Obtener ubicación actual</button>
      </div>

      <div class="card p-3 mt-3 shadow-sm">
        <h5>📋 Detalles de ubicación</h5>
        <input id="pais" class="form-control mb-2" placeholder="País" />
        <input id="region" class="form-control mb-2" placeholder="Región / Estado" />
        <input id="comuna" class="form-control mb-2" placeholder="Comuna / Municipio" />
        <input id="latitud" class="form-control mb-2" placeholder="Latitud" readonly />
        <input id="longitud" class="form-control mb-2" placeholder="Longitud" readonly />
      </div>
    </div>
  `;

  // Navegación
  root.querySelectorAll(".main-navbar button[data-view]").forEach(btn =>
    btn.addEventListener("click", () => navigate(btn.dataset.view))
  );

  // === Inicializar mapa ===
  const map = L.map("map").setView([-33.45, -70.65], 13); // Santiago por defecto
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);

  let marker = null;
  const btnGetLocation = document.getElementById("btnGetLocation");

  // === Función: obtener y mostrar ubicación ===
  btnGetLocation.onclick = async () => {
    if (!navigator.geolocation) {
      alert("❌ Tu navegador no soporta geolocalización.");
      return;
    }

    btnGetLocation.disabled = true;
    btnGetLocation.textContent = "Obteniendo ubicación...";

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Actualiza los campos de lat/lon
        document.getElementById("latitud").value = lat.toFixed(6);
        document.getElementById("longitud").value = lon.toFixed(6);

        // Mueve el mapa y el marcador
        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lon]).addTo(map).bindPopup("📍 Estás aquí").openPopup();
        map.setView([lat, lon], 15);

        // === Inversión geocodificación: obtener país, región y comuna ===
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
          );
          const data = await res.json();
          const address = data.address || {};

          document.getElementById("pais").value =
            address.country || "Desconocido";
          document.getElementById("region").value =
            address.state || address.region || "Desconocido";
          document.getElementById("comuna").value =
            address.city || address.town || address.village || address.municipality || "Desconocido";
        } catch (error) {
          console.error("Error al obtener los datos de ubicación:", error);
          alert("⚠️ No se pudo obtener información detallada del lugar.");
        }

        btnGetLocation.textContent = "📡 Obtener ubicación actual";
        btnGetLocation.disabled = false;
        alert("✅ Ubicación actualizada correctamente.");
      },
      (err) => {
        alert("⚠️ No se pudo obtener la ubicación: " + err.message);
        btnGetLocation.textContent = "📡 Obtener ubicación actual";
        btnGetLocation.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
}
