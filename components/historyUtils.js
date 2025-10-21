import { auth, db, ref, onValue } from "../firebaseConfig.js";
import { navigate } from "../app.js";
import { getLastHistory, getFullHistory } from "./historyUtils.js";

// --- ID del dispositivo por defecto ---
const DEVICE_ID_DEFAULT = "tuDeviceID"; // Cambiar por el ID real

// --- Vista principal ---
export function showDevices() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Dispositivo Asignado</h2>
      <div class="actions">
        <button id="back">⬅️ Volver</button>
        <button id="refreshBtn">🔄 Actualizar datos</button>
        <button id="verHistorialBtn">📄 Ver historial completo</button>
        <button id="page1Btn">Página 1</button>
        <button id="page2Btn">Página 2</button>
        <button id="guardarMedicionBtn">💾 Guardar medición</button>
      </div>
      <div id="deviceData" class="deviceDetails">Cargando dispositivo...</div>
    </div>
  `;

  const deviceDataDiv = document.getElementById("deviceData");

  // Botones
  document.getElementById("back").onclick = () => navigate("user");
  document.getElementById("refreshBtn").onclick = () => mostrarDatosDispositivo(DEVICE_ID_DEFAULT, deviceDataDiv);
  document.getElementById("verHistorialBtn").onclick = () => showFullHistoryPage(DEVICE_ID_DEFAULT);
  document.getElementById("page1Btn").onclick = () => alert("Navegar a Página 1"); // Ajustar según tu app
  document.getElementById("page2Btn").onclick = () => alert("Navegar a Página 2"); // Ajustar según tu app
  document.getElementById("guardarMedicionBtn").onclick = () => guardarMedicion(DEVICE_ID_DEFAULT);

  mostrarDatosDispositivo(DEVICE_ID_DEFAULT, deviceDataDiv);
}

// --- Mostrar datos y último historial ---
function mostrarDatosDispositivo(deviceId, container) {
  const deviceRef = ref(db, `dispositivos/${deviceId}`);
  onValue(deviceRef, snapshot => {
    const d = snapshot.val();
    if (!d) return container.innerHTML = `<p>No se encontró ningún dispositivo con ID: <b>${deviceId}</b></p>`;

    container.innerHTML = `
      <p><b>ID:</b> ${deviceId}</p>
      <p><b>Nombre:</b> ${d.name || "Desconocido"}</p>
      <p><b>Usuario:</b> ${d.userEmail || "Sin asignar"}</p>
      <p>CO: ${d.CO ?? 0} ppm</p>
      <p>CO₂: ${d.CO2 ?? 0} ppm</p>
      <p>PM10: ${d.PM10 ?? 0} µg/m³</p>
      <p>PM2.5: ${d.PM2_5 ?? 0} µg/m³</p>
      <p>Humedad: ${d.humedad ?? 0}%</p>
      <p>Temperatura: ${d.temperatura ?? 0} °C</p>
      <h4>📜 Últimos registros históricos</h4>
      <div id="historialCarrusel" class="historialCarrusel">Cargando...</div>
    `;

    getLastHistory(deviceId, 10, registros => {
      const carrusel = document.getElementById("historialCarrusel");
      carrusel.innerHTML = "";
      if (registros.length === 0) return carrusel.innerHTML = "<p>No hay datos históricos.</p>";

      registros.forEach(([ts, datos]) => {
        const card = document.createElement("div");
        card.className = "historialCard";
        card.innerHTML = `
          <p><b>${new Date(parseInt(ts)).toLocaleString("es-CL")}</b></p>
          <p>CO: ${datos.CO ?? "—"} ppm</p>
          <p>CO₂: ${datos.CO2 ?? "—"} ppm</p>
          <p>PM10: ${datos.PM10 ?? "—"} µg/m³</p>
          <p>PM2.5: ${datos.PM2_5 ?? "—"} µg/m³</p>
          <p>Humedad: ${datos.humedad ?? "—"}%</p>
          <p>Temperatura: ${datos.temperatura ?? "—"} °C</p>
        `;
        carrusel.appendChild(card);
      });
    });
  });
}

// --- Guardar medición manualmente ---
function guardarMedicion(deviceId) {
  const deviceRef = ref(db, `dispositivos/${deviceId}`);
  onValue(deviceRef, snapshot => {
    const d = snapshot.val();
    if (!d) return alert("No se pudo guardar la medición: dispositivo no encontrado.");

    const timestamp = Date.now();
    const newRegistro = {
      CO: d.CO ?? 0,
      CO2: d.CO2 ?? 0,
      PM10: d.PM10 ?? 0,
      PM2_5: d.PM2_5 ?? 0,
      humedad: d.humedad ?? 0,
      temperatura: d.temperatura ?? 0
    };

    const histRef = ref(db, `dispositivos/${deviceId}/historial/${timestamp}`);
    histRef.set(newRegistro)
      .then(() => alert("Medición guardada correctamente."))
      .catch(err => alert("Error al guardar la medición: " + err.message));
  }, { onlyOnce: true });
}

// --- Página Historial Completo ---
function showFullHistoryPage(deviceId) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Historial Completo del Dispositivo</h2>
      <p><strong>ID:</strong> ${deviceId}</p>
      <div class="actions">
          <button id="backToDeviceBtn">⬅️ Volver</button>
          <button id="refreshHistBtn">🔄 Actualizar historial</button>
          <button id="savePdfBtn" disabled>💾 Guardar como PDF</button>
          <button id="saveExcelBtn" disabled>📊 Guardar como Excel</button>
          <button id="page1Btn">Página 1</button>
          <button id="page2Btn">Página 2</button>
      </div>
      <div id="fullHistorialContainer" class="historialDetails">Cargando historial...</div>
    </div>
  `;

  const fullHistorialDiv = document.getElementById('fullHistorialContainer');
  const savePdfBtn = document.getElementById('savePdfBtn');
  const saveExcelBtn = document.getElementById('saveExcelBtn');

  // Botones
  document.getElementById('backToDeviceBtn').onclick = () => showDevices();
  document.getElementById('refreshHistBtn').onclick = () => cargarHistorial(deviceId, fullHistorialDiv, savePdfBtn, saveExcelBtn);
  document.getElementById("page1Btn").onclick = () => alert("Navegar a Página 1"); 
  document.getElementById("page2Btn").onclick = () => alert("Navegar a Página 2"); 

  cargarHistorial(deviceId, fullHistorialDiv, savePdfBtn, saveExcelBtn);
}

// --- Función para cargar historial completo ---
function cargarHistorial(deviceId, container, btnPDF, btnExcel) {
  getFullHistory(deviceId, registros => {
    if (registros.length === 0) {
      container.innerHTML = "<p>No hay datos históricos para mostrar.</p>";
      btnPDF.disabled = true;
      btnExcel.disabled = true;
      return;
    }

    container.innerHTML = "<h4>Todos los registros:</h4>";
    registros.forEach(([timestamp, valores]) => {
      const fecha = new Date(parseInt(timestamp)).toLocaleString("es-CL", { dateStyle: 'short', timeStyle: 'medium' });
      container.innerHTML += `
        <div class="historialItem">
          <p><b>${fecha}</b></p>
          <p>CO: ${valores.CO ?? "—"} ppm</p>
          <p>CO₂: ${valores.CO2 ?? "—"} ppm</p>
          <p>PM10: ${valores.PM10 ?? "—"} µg/m³</p>
          <p>PM2.5: ${valores.PM2_5 ?? "—"} µg/m³</p>
          <p>Humedad: ${valores.humedad ?? "—"}%</p>
          <p>Temperatura: ${valores.temperatura ?? "—"} °C</p>
          <hr>
        </div>
      `;
    });

    btnPDF.disabled = false;
    btnExcel.disabled = false;
    btnPDF.onclick = () => guardarHistorialComoPDF(deviceId, registros);
    btnExcel.onclick = () => guardarHistorialComoExcel(deviceId, registros);
  });
}

// --- Guardar PDF ---
function guardarHistorialComoPDF(deviceId, registros) {
  if (typeof window.jspdf === 'undefined') {
      alert("Error: La funcionalidad para crear PDF no está disponible.");
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
    if (y > 280) { doc.addPage(); y = 20; }
    const fecha = new Date(parseInt(timestamp)).toLocaleString("es-CL");
    doc.setFontSize(12); doc.text(`Fecha: ${fecha}`, 14, y); y += 7;
    doc.setFontSize(10);
    doc.text(`- CO: ${valores.CO ?? "—"} ppm, CO₂: ${valores.CO2 ?? "—"} ppm`, 20, y); y += 6;
    doc.text(`- PM10: ${valores.PM10 ?? "—"} µg/m³, PM2.5: ${valores.PM2_5 ?? "—"} µg/m³`, 20, y); y += 6;
    doc.text(`- Humedad: ${valores.humedad ?? "—"}%, Temperatura: ${valores.temperatura ?? "—"} °C`, 20, y); y += 10;
  });

  doc.save(`historial-dispositivo-${deviceId}.pdf`);
}

// --- Guardar Excel (CSV) ---
function guardarHistorialComoExcel(deviceId, registros) {
  let csv = "Fecha,CO,CO2,PM10,PM2_5,Humedad,Temperatura\n";
  registros.forEach(([timestamp, valores]) => {
    const fecha = new Date(parseInt(timestamp)).toLocaleString("es-CL");
    csv += `${fecha},${valores.CO ?? ""},${valores.CO2 ?? ""},${valores.PM10 ?? ""},${valores.PM2_5 ?? ""},${valores.humedad ?? ""},${valores.temperatura ?? ""}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `historial-dispositivo-${deviceId}.csv`;
  link.click();
}
