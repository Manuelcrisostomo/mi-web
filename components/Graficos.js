// ================================================
// Graficos.js — Muestra gráficos de sensores
// ================================================
import { db, ref, onValue } from "../firebaseConfig.js";
import { navigate } from "../app.js";

export function showGraficos() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <nav class="main-navbar">
      <button data-view="user">🏠 Menú Principal</button>
      <button data-view="devices">💡 Dispositivos</button>
      <button data-view="usuarios">👥 Usuarios</button>
      <button data-view="geolocalizacion">📍 Mapa</button>
      <button class="logout">🚪 Cerrar Sesión</button>
    </nav>

    <div class="dashboard">
      <h2>📊 Gráficos de Sensores</h2>
      <canvas id="chart" width="400" height="200"></canvas>
    </div>
  `;

  root.querySelectorAll(".main-navbar button[data-view]").forEach(btn =>
    btn.addEventListener("click", () => navigate(btn.dataset.view))
  );

  const ctx = document.getElementById("chart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "CO", data: [], borderColor: "#dc3545" },
        { label: "CO₂", data: [], borderColor: "#17a2b8" },
        { label: "PM2.5", data: [], borderColor: "#ffc107" }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  const deviceRef = ref(db, "dispositivos/device_38A839E81F84");
  onValue(deviceRef, (snap) => {
    const d = snap.val();
    if (!d) return;
    chart.data.labels.push(new Date().toLocaleTimeString());
    chart.data.datasets[0].data.push(d.CO || 0);
    chart.data.datasets[1].data.push(d.CO2 || 0);
    chart.data.datasets[2].data.push(d.PM2_5 || 0);
    chart.update();
  });
}
