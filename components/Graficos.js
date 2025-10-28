// graficos.js
// ================================================
// Graficos.js — Visualización de gráficos de sensores con barra de navegación
// ================================================
import Chart from "chart.js/auto";
import { db, ref, onValue, auth } from "../firebaseConfig.js";

export function showGraficos() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <!-- Barra de navegación Minesafe 2 -->
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Minesafe 2</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" 
                aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
          <ul class="navbar-nav">
            <li class="nav-item"><a class="nav-link" href="#" id="navUserForm">👤 Datos Personales</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="navTipoMina">⛏️ Tipo de Mina</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="navGeoEmpresa">🌍 Geo / Empresa</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="navDevices">💡 Dispositivos</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="navAlerts">🚨 Alertas</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="navHistorialCompleto">📜 Historial Completo</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="navHistorialManage">🗂️ Historial Manage</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="usuariosBtn">👥 Usuarios</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="graficosBtn">📊 Gráficos</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="geoBtn">📍 Mapa</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="navLogout">🔒 Cerrar Sesión</a></li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Contenido de Gráficos -->
    <div class="dashboard mt-3">
      <h2>📊 Gráficos de Sensores</h2>
      <div class="card">
        <canvas id="chartMediciones"></canvas>
      </div>
    </div>
  `;

  // Redirecciones de la barra de navegación
  document.getElementById("usuariosBtn").onclick = () => navigate("usuarios");
  document.getElementById("graficosBtn").onclick = () => navigate("graficos");
  document.getElementById("geoBtn").onclick = () => navigate("geolocalizacion");

  document.getElementById("navUserForm").onclick = () => navigate("userform");
  document.getElementById("navTipoMina").onclick = () => navigate("tipomina");
  document.getElementById("navGeoEmpresa").onclick = () => navigate("geoempresa");
  document.getElementById("navDevices").onclick = () => navigate("devices");
  document.getElementById("navAlerts").onclick = () => navigate("alerts");
  document.getElementById("navHistorialCompleto").onclick = () => navigate("history");
  document.getElementById("navHistorialManage").onclick = () => navigate("manager");
  document.getElementById("navLogout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // Configuración de los gráficos
  const ctx = document.getElementById("chartMediciones").getContext("2d");
  const deviceId = "device_A4CB2F124B00";
  const histRef = ref(db, `dispositivos/${deviceId}/historial_global`);

  onValue(histRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const fechas = [];
    const co = [], co2 = [], pm10 = [], pm25 = [];
    Object.entries(data).slice(-20).forEach(([t, v]) => {
      fechas.push(new Date(parseInt(t)).toLocaleTimeString());
      co.push(v.CO || 0);
      co2.push(v.CO2 || 0);
      pm10.push(v.PM10 || 0);
      pm25.push(v.PM2_5 || 0);
    });

    new Chart(ctx, {
      type: "line",
      data: {
        labels: fechas,
        datasets: [
          { label: "CO (ppm)", data: co, borderColor: "#dc3545", fill: false },
          { label: "CO₂ (ppm)", data: co2, borderColor: "#007bff", fill: false },
          { label: "PM10 (µg/m³)", data: pm10, borderColor: "#ffc107", fill: false },
          { label: "PM2.5 (µg/m³)", data: pm25, borderColor: "#28a745", fill: false }
        ]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } },
    });
  });
}
// ================================================