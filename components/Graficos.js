import { db, ref, onValue } from "../firebaseConfig.js";
import Chart from "chart.js/auto";
import { navigate } from "../app.js";
import { renderNavbar } from "./navbar.js"; // ✅ importamos la navbar

let lastPage = "usuarios"; // Página anterior inicial

export function showGraficos() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Limpiamos root

  // ==== NAVBAR GLOBAL ====
  const navbar = renderNavbar();
  root.appendChild(navbar);

  // ==== CONTENIDO PRINCIPAL ====
  const content = document.createElement("div");
  content.className = "page-content";
  content.innerHTML = `
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
  root.appendChild(content);

  // ==== BOTÓN VOLVER ====
  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    navigate(lastPage);
  });

  // Actualiza la página anterior
  lastPage = "graficos";

  // ==== CARGA DE DATOS PARA EL GRÁFICO ====
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
