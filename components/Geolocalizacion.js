// ================================================
// Geolocalizacion.js — Mapa + Datos + Formulario
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

      <div id="geoDatos" class="card mt-3 p-3 shadow-sm">
        <h4>📄 Datos de ubicación actual</h4>
        <p><strong>Latitud:</strong> <span id="latitud">--</span></p>
        <p><strong>Longitud:</strong> <span id="longitud">--</span></p>
        <p><strong>Precisión:</strong> <span id="precision">--</span> m</p>
        <p><strong>Altitud:</strong> <span id="altitud">--</span> m</p>
      </div>

      <div class="card mt-3 p-3 shadow-sm">
        <h4>✏️ Formulario de corrección</h4>
        <form id="geoForm">
          <input id="latInput" type="number" step="any" class="form-control mb-2" placeholder="Latitud" required />
          <input id="lonInput" type="number" step="any" class="form-control mb-2" placeholder="Longitud" required />
          <input id="altInput" type="number" step="any" class="form-control mb-2" placeholder="Altitud (opcional)" />
          <button type="submit" class="btn btn-success w-100 mb-2">💾 Guardar cambios</button>
        </form>
        <button id="getLocationBtn" class="btn btn-primary w-100">📡 Obtener ubicación actual</button>
      </div>
    </div>
  `;

  // Navegación principal
  root.querySelectorAll(".main-navbar button[data-view]").forEach(btn =>
    btn.addEventListener("click", () => navigate(btn.dataset.view))
  );

  // Inicializar mapa
  const map = L.map("map").setView([-33.45, -70.65], 13); // Santiago por defecto
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);
  let marker;

  // Función para actualizar mapa y datos
  function actualizarMapa(lat, lon, acc = "--", alt = "--") {
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon]).addTo(map).bindPopup("📍 Ubicación actual").openPopup();
    map.setView([lat, lon], 15);
    document.getElementById("latitud").textContent = lat.toFixed(6);
    document.getElementById("longitud").textContent = lon.toFixed(6);
    document.getElementById("precision").textContent = acc !== "--" ? acc.toFixed(2) : "--";
    document.getElementById("altitud").textContent = alt !== "--" ? alt.toFixed(2) : "--";
    // Sincronizar con el formulario
    document.getElementById("latInput").value = lat.toFixed(6);
    document.getElementById("lonInput").value = lon.toFixed(6);
    if (alt !== "--") document.getElementById("altInput").value = alt.toFixed(2);
  }

  // Botón obtener ubicación actual
  const getLocationBtn = document.getElementById("getLocationBtn");
  getLocationBtn.onclick = () => {
    if (navigator.geolocation) {
      getLocationBtn.disabled = true;
      getLocationBtn.textContent = "📡 Obteniendo...";
      navigator.geolocation.getCurrentPosition(
        pos => {
          actualizarMapa(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy,
            pos.coords.altitude || "--"
          );
          getLocationBtn.disabled = false;
          getLocationBtn.textContent = "📡 Obtener ubicación actual";
        },
        err => {
          alert("⚠️ No se pudo obtener la ubicación: " + err.message);
          getLocationBtn.disabled = false;
          getLocationBtn.textContent = "📡 Obtener ubicación actual";
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  // Formulario manual
  document.getElementById("geoForm").onsubmit = e => {
    e.preventDefault();
    const lat = parseFloat(document.getElementById("latInput").value);
    const lon = parseFloat(document.getElementById("lonInput").value);
    const alt = parseFloat(document.getElementById("altInput").value) || "--";
    actualizarMapa(lat, lon, "--", alt);
    alert("✅ Datos de ubicación actualizados manualmente.");
  };
}
