// ================================================
// historyManager.js
// ================================================

import { db, ref, onValue, auth } from "../firebaseConfig.js";
import { navigate } from "../app.js";

// Arreglo que almacena TODOS los datos guardados manualmente
let savedData = [];

// ================================================
// Mostrar la nueva página del Historial Manager
// ================================================
export function showHistoryManagerPage() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Historial Manager</h2>
      <div class="actions">
        <button id="backBtn">⬅️ Volver</button>
        <button id="refreshBtn">🔄 Actualizar datos</button>
        <button id="saveManualBtn">💾 Guardar datos manualmente</button>
      </div>
      <div id="managerData" class="historialDetails">Cargando datos...</div>
      <h3>Datos Guardados</h3>
      <div id="savedDataContainer" class="historialDetails">No hay datos guardados aún.</div>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => navigate("user");
  document.getElementById("refreshBtn").onclick = () => loadManagerData();
  document.getElementById("saveManualBtn").onclick = () => saveCurrentData();

  // Carga inicial de los datos del dispositivo
  loadManagerData();
}

// ================================================
// Cargar datos actuales del dispositivo
// ================================================
let currentDeviceData = {}; // Guardará temporalmente los datos actuales del dispositivo

function loadManagerData() {
  const container = document.getElementById("managerData");
  const DEVICE_ID_DEFAULT = "device_A4CB2F124B00";

  const deviceRef = ref(db, `dispositivos/${DEVICE_ID_DEFAULT}`);
  onValue(deviceRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      container.innerHTML = "<p>No se encontraron datos para este dispositivo.</p>";
      return;
    }

    // Guardar datos actuales temporalmente
    currentDeviceData = {
      id: DEVICE_ID_DEFAULT,
      name: data.name || "Desconocido",
      user: data.userEmail || "Sin asignar",
      CO: data.CO ?? 0,
      CO2: data.CO2 ?? 0,
      PM10: data.PM10 ?? 0,
      PM2_5: data.PM2_5 ?? 0,
      humedad: data.humedad ?? 0,
      temperatura: data.temperatura ?? 0,
      fecha: new Date().toLocaleString("es-CL")
    };

    // Mostrar datos actuales en pantalla
    container.innerHTML = `
      <p><b>ID:</b> ${currentDeviceData.id}</p>
      <p><b>Nombre:</b> ${currentDeviceData.name}</p>
      <p><b>Usuario:</b> ${currentDeviceData.user}</p>
      <p>CO: ${currentDeviceData.CO} ppm</p>
      <p>CO₂: ${currentDeviceData.CO2} ppm</p>
      <p>PM10: ${currentDeviceData.PM10} µg/m³</p>
      <p>PM2.5: ${currentDeviceData.PM2_5} µg/m³</p>
      <p>Humedad: ${currentDeviceData.humedad}%</p>
      <p>Temperatura: ${currentDeviceData.temperatura} °C</p>
      <p><i>Última actualización: ${currentDeviceData.fecha}</i></p>
    `;
  });
}

// ================================================
// Guardar datos manualmente sin reemplazar anteriores
// ================================================
function saveCurrentData() {
  if (!currentDeviceData || !currentDeviceData.id) return;

  // Agrega un nuevo registro al arreglo (sin borrar los anteriores)
  savedData.push({ ...currentDeviceData });

  // Actualizar la vista de datos guardados
  const savedContainer = document.getElementById("savedDataContainer");

  savedContainer.innerHTML = savedData
    .map(
      (d, index) => `
      <div class="historialItem" style="border:1px solid #ccc; padding:10px; margin:5px; border-radius:8px;">
        <p><b>Registro #${index + 1}</b> - ${d.fecha}</p>
        <p>CO: ${d.CO} ppm | CO₂: ${d.CO2} ppm</p>
        <p>PM10: ${d.PM10} µg/m³ | PM2.5: ${d.PM2_5} µg/m³</p>
        <p>Humedad: ${d.humedad}% | Temperatura: ${d.temperatura} °C</p>
      </div>
    `
    )
    .join("");
}
