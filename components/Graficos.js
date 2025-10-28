import { db, ref, onValue } from "../firebaseConfig.js";
import Chart from "chart.js/auto";
import { navigate } from "../app.js";

// Variable para almacenar la página anterior
let lastPage = "usuarios"; // Página por defecto si no hay historial

export function showGraficos() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <button id="backBtn" class="btn-volver">⬅️ Volver</button>
      <h2>📊 Gráficos de Sensores</h2>
      <div class="card">
        <canvas id="chartMediciones"></canvas>
      </div>
    </div>
  `;

  // Botón Volver atrás
  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    navigate(lastPage); // Navega a la última página visitada
  });

  // Actualiza la página anterior al entrar en Gráficos
  lastPage = document.querySelector(".page-content") ? "usuarios" : lastPage;

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
// Función para establecer la página anterior 