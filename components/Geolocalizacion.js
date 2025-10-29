// ================================================
// Geolocalizacion.js — Mapa con Leaflet + navbar y modo oscuro
// ================================================
import { navigate } from "../app.js";

export function showGeolocalizacion() {
  const root = document.getElementById("root");
  root.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-warning" href="#">📍 Geolocalización</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navGeo"
        aria-controls="navGeo" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navGeo">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><button class="nav-link btn-link" data-view="user">🏠 Inicio</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="devices">💡 Dispositivos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="graficos">📊 Gráficos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="usuarios">👥 Usuarios</button></li>
        </ul>
        <div class="d-flex">
          <button id="themeToggle" class="btn btn-warning btn-sm me-2">🌙</button>
          <button class="btn btn-danger btn-sm logout">🚪 Cerrar Sesión</button>
        </div>
      </div>
    </div>
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

  // === Navbar navegación ===
  root.querySelectorAll("button[data-view]").forEach(btn =>
    btn.addEventListener("click", () => navigate(btn.dataset.view))
  );

  // Logout
  document.querySelector(".logout").onclick = () => navigate("login");

  // Tema oscuro
  const themeBtn = document.getElementById("themeToggle");
  themeBtn.onclick = () => {
    document.body.classList.toggle("dark-mode");
    themeBtn.textContent = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";

    // Cambiar colores de inputs y dashboard
    const inputs = document.querySelectorAll(".form-control");
    inputs.forEach(i => i.classList.toggle("input-dark"));
    document.querySelector(".dashboard").classList.toggle("dashboard-dark");
  };

  // Aplicar tema guardado
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.textContent = "🌞";
    const inputs = document.querySelectorAll(".form-control");
    inputs.forEach(i => i.classList.add("input-dark"));
    document.querySelector(".dashboard").classList.add("dashboard-dark");
  }

  // === Inicializar mapa ===
  const map = L.map("map").setView([-33.45, -70.65], 13); // Santiago por defecto
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(map);

  let marker = null;
  const btnGetLocation = document.getElementById("btnGetLocation");

  // === Función obtener ubicación ===
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

        document.getElementById("latitud").value = lat.toFixed(6);
        document.getElementById("longitud").value = lon.toFixed(6);

        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lon]).addTo(map).bindPopup("📍 Estás aquí").openPopup();
        map.setView([lat, lon], 15);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
          );
          const data = await res.json();
          const address = data.address || {};
          document.getElementById("pais").value = address.country || "Desconocido";
          document.getElementById("region").value = address.state || address.region || "Desconocido";
          document.getElementById("comuna").value = address.city || address.town || address.village || address.municipality || "Desconocido";
        } catch (error) {
          console.error(error);
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
