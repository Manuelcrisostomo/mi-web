import { db, ref, onValue } from "../firebaseConfig.js";
import { showDevices } from "./showDevices.js";

// --- Vista para mostrar TODOS los dispositivos ---
export function showAllDevices() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Historial de Dispositivos</h2>
      <p>Selecciona un dispositivo para ver todos sus registros guardados.</p>
      <div id="deviceList" class="deviceListContainer">Cargando lista de dispositivos...</div>
      <button id="backToCurrentDevice">⬅️ Volver al dispositivo actual</button>
    </div>
  `;

  document.getElementById("backToCurrentDevice").onclick = () => showDevices();

  const deviceListDiv = document.getElementById("deviceList");
  const devicesRef = ref(db, "dispositivos");

  onValue(
    devicesRef,
    (snapshot) => {
      const devices = snapshot.val();
      if (!devices) {
        deviceListDiv.innerHTML = "<p>No hay dispositivos en la base de datos.</p>";
        return;
      }

      deviceListDiv.innerHTML = "<ul>";
      for (const deviceId in devices) {
        const deviceName = devices[deviceId].name || `Dispositivo ${deviceId}`;
        deviceListDiv.innerHTML += `
          <li>
            <span>${deviceName} (ID: ${deviceId})</span>
            <button id="histBtn_${deviceId}">📜 Ver Historial</button>
          </li>
        `;
        // Agregar evento al botón de cada dispositivo
        document
          .getElementById(`histBtn_${deviceId}`)
          .addEventListener("click", () =>
            showHistoricalPage(deviceId, "showAllDevices")
          );
      }
      deviceListDiv.innerHTML += "</ul>";
    },
    { onlyOnce: true }
  );
}

// --- Historial completo del dispositivo ---
export function showHistoricalPage(deviceId, volverA = "showDevices") {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Historial Completo del Dispositivo</h2>
      <p><strong>ID:</strong> ${deviceId}</p>
      <div class="actions">
          <button id="savePdfBtn" disabled>💾 Guardar como PDF</button>
          <button id="backBtn">⬅️ Volver</button>
      </div>
      <div id="fullHistorialContainer" class="historialDetails">Cargando historial...</div>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => {
    if (volverA === "showDevices") showDevices();
    else if (volverA === "showAllDevices") showAllDevices();
  };

  const fullHistorialDiv = document.getElementById("fullHistorialContainer");
  const savePdfBtn = document.getElementById("savePdfBtn");

  const historialRef = ref(db, `dispositivos/${deviceId}/historial`);
  onValue(
    historialRef,
    (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        fullHistorialDiv.innerHTML =
          "<p>No hay datos históricos para este dispositivo.</p>";
        savePdfBtn.disabled = true;
        return;
      }

      const registros = Object.entries(data).sort(
        (a, b) => parseInt(b[0]) - parseInt(a[0])
      );

      fullHistorialDiv.innerHTML = "<h4>Todos los registros:</h4>";
      registros.forEach(([timestamp, valores]) => {
        const fecha = new Date(parseInt(timestamp)).toLocaleString("es-CL", {
          dateStyle: "short",
          timeStyle: "medium",
        });
        fullHistorialDiv.innerHTML += `
          <div class="historialItem">
            <p><b>${fecha}</b></p>
            <p>CO: ${valores.CO ?? "—"} ppm, CO₂: ${valores.CO2 ?? "—"} ppm</p>
            <p>PM10: ${valores.PM10 ?? "—"} µg/m³, PM2.5: ${valores.PM2_5 ?? "—"} µg/m³</p>
            <p>Humedad: ${valores.humedad ?? "—"}%, Temperatura: ${
          valores.temperatura ?? "—"
        } °C</p>
            <hr>
          </div>
        `;
      });

      savePdfBtn.disabled = false;
      savePdfBtn.onclick = () => guardarHistorialComoPDF(deviceId, registros);
    },
    { onlyOnce: true }
  );
}

// --- Función PDF ---
function guardarHistorialComoPDF(deviceId, registros) {
  if (typeof window.jspdf === "undefined") {
    alert("Error: Librería jsPDF no cargada.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Historial del Dispositivo: ${deviceId}`, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleString("es-CL")}`, 14, 30);

  let y = 40;
  registros.forEach(([timestamp, valores]) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }

    const fecha = new Date(parseInt(timestamp)).toLocaleString("es-CL");
    doc.setFontSize(12);
    doc.text(`Fecha: ${fecha}`, 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(
      `- CO: ${valores.CO ?? "—"} ppm, CO₂: ${valores.CO2 ?? "—"} ppm`,
      20,
      y
    );
    y += 6;
    doc.text(
      `- PM10: ${valores.PM10 ?? "—"} µg/m³, PM2.5: ${valores.PM2_5 ?? "—"} µg/m³`,
      20,
      y
    );
    y += 6;
    doc.text(
      `- Humedad: ${valores.humedad ?? "—"}%, Temp: ${valores.temperatura ?? "—"} °C`,
      20,
      y
    );
    y += 10;
  });

  doc.save(`historial-dispositivo-${deviceId}.pdf`);
}
