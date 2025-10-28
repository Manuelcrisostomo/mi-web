import { db, ref, onValue } from "../firebaseConfig.js";
import Chart from "chart.js/auto";
import { navigate } from "../app.js";

// Historial simple de navegación
let lastPage = "usuarios"; // Cambia según tu flujo inicial

export function showGraficos() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <!-- Navbar estilo Bootstrap -->
    <nav class="navbar navbar-expand-lg bg-body-tertiary mb-3">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Minesafe 2</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
          <ul class="navbar-nav">
            <li class="nav-item"><a class="nav-link" href="#" id="navUser">Usuarios</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="navGraficos">Gráficos</a></li>
            <li class="nav-item"><a class="nav-link" href="#" id="navGeo">Geolocalización</a></li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="dashboard">
      <div class="actions mb-3">
        <button id="backBtn" class="btn-volver">⬅️ Volver</button>
      </div>
      <h2>📊 Gráficos de Sensores</h2>
      <div class="card">
        <canvas id="chartMediciones"></canvas>
      </div>
    </div>
  `;

  // ==== BOTONES NAVBAR ====
  document.getElementById("navUser").onclick = () => navigate("usuarios");
  document.getElementById("navGraficos").onclick = () => navigate("graficos");
  document.getElementById("navGeo").onclick = () => navigate("geolocalizacion");

  // ==== BOTÓN VOLVER ====
  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    navigate(lastPage); // regresa a la última página
  });

  // Actualiza lastPage al entrar aquí
  lastPage = "graficos";

  // ==== CARGAR GRÁFICO ====
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
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  });
}
// ================================================
// FIN COMPONENTE GRÁFICOS
// ================================================