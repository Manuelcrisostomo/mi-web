// DeviceView.js================================================
// Dispositivos y Historial con Firebase + Localización por tipo de mina
// ================================================
// NOTA: Para que la función de guardar PDF funcione, debes incluir la librería jsPDF
// en tu archivo HTML principal:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

import { db, ref, onValue, set, auth, onAuthStateChanged } from "../firebaseConfig.js";
import { navigate } from "../app.js";
import { showHistoryManagerPage } from "./historyManager.js";

// --- ID del dispositivo por defecto ---
const DEVICE_ID_DEFAULT = "device_A4CB2F124B00";

// ================================================
// INICIALIZACIÓN CON LOGIN
// ================================================
export function initDashboard() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showDevices();
    } else {
      navigate("login");
    }
  });
}

// ================================================
// VISTA PRINCIPAL DEL DISPOSITIVO
// ================================================
export function showDevices() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Dispositivo Asignado</h2>

      <!-- ================================================
           BARRA DE BOTONES PRINCIPAL (ACTUALIZADA)
           ================================================ -->
      <div class="actions">
        <button id="back">⬅️ Volver</button>
        <button id="refreshBtn">🔄 Actualizar datos</button>
        <button id="verHistorialBtn">📜 Ver historial completo</button>
        <button id="saveCurrentBtn">💾 Guardar medición</button>

        <!-- 🔹 NUEVOS BOTONES AÑADIDOS -->
        <button id="userFormBtn">👤 Datos Personales</button>
        <button id="tipoMinaBtn">⛏️ Tipo de Mina</button>
        <button id="geoEmpresaBtn">🌍 Geo / Empresa</button>
        <!-- 🔹 NUEVOS BOTONES AÑADIDOS -->
        <button id="usuariosBtn">👥 Usuarios</button>
        <button id="graficosBtn">📊 Gráficos</button>
        <button id="geoBtn">📍 Mapa</button>

      </div>

      <div id="deviceData" class="deviceDetails">Cargando dispositivo...</div>
      <div id="camposMinaDiv" class="camposMina"></div>
    </div>
  `;

  const deviceDataDiv = document.getElementById("deviceData");

  // ================================================
  // EVENTOS DE LOS BOTONES
  // ================================================
  document.getElementById("back").onclick = () => navigate("user");
  document.getElementById("refreshBtn").onclick = () =>
    mostrarDatosDispositivo(DEVICE_ID_DEFAULT, deviceDataDiv);
  document.getElementById("verHistorialBtn").onclick = () =>
    showHistoricalPage(DEVICE_ID_DEFAULT);
  document.getElementById("saveCurrentBtn").onclick = () =>
    guardarMedicionActual(DEVICE_ID_DEFAULT);

  // 🔹 NUEVOS BOTONES DE NAVEGACIÓN
  document.getElementById("userFormBtn").onclick = () => navigate("userform");
  document.getElementById("tipoMinaBtn").onclick = () => navigate("tipomina");
  document.getElementById("geoEmpresaBtn").onclick = () => navigate("geoempresa");
  document.getElementById("usuariosBtn").onclick = () => navigate("usuarios");
  document.getElementById("graficosBtn").onclick = () => navigate("graficos");
  document.getElementById("geoBtn").onclick = () => navigate("geolocalizacion");

  // Cargar datos iniciales
  mostrarDatosDispositivo(DEVICE_ID_DEFAULT, deviceDataDiv);
}

// ================================================
// MOSTRAR DATOS DEL DISPOSITIVO + LOCALIZACIÓN POR TIPO DE MINA
// ================================================
function mostrarDatosDispositivo(deviceId, container) {
  const deviceRef = ref(db, `dispositivos/${deviceId}`);
  const camposMinaDiv = document.getElementById("camposMinaDiv");

  onValue(deviceRef, (snapshot) => {
    const d = snapshot.val();
    if (!d) {
      container.innerHTML = `<p>No se encontró ningún dispositivo con ID: <b>${deviceId}</b></p>`;
      camposMinaDiv.innerHTML = "";
      return;
    }

    // Guardar valores actuales en dataset para botón guardar
    container.dataset.CO = d.CO ?? 0;
    container.dataset.CO2 = d.CO2 ?? 0;
    container.dataset.PM10 = d.PM10 ?? 0;
    container.dataset.PM2_5 = d.PM2_5 ?? 0;
    container.dataset.humedad = d.humedad ?? 0;
    container.dataset.temperatura = d.temperatura ?? 0;

    // Mostrar valores generales
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
    `;

    // Renderizar campos según tipo de mina
    renderCampos(d.tipoMina, d, camposMinaDiv);
  });
}

// ================================================
// FUNCION RENDER CAMPOS SEGÚN TIPO DE MINA
// ================================================
function renderCampos(tipo, data, container) {
  let html = "";
  switch (tipo) {
    case "subterranea":
      html = `
        <h4>⛏️ Subterránea</h4>
        <p>Zona: ${data.zona ?? ""}</p>
        <p>Rampa: ${data.rampa ?? ""}</p>
        <p>Galería: ${data.galeria ?? ""}</p>
        <p>Sector: ${data.sector ?? ""}</p>
        <p>Nombre de estación: ${data.nombreEstacion ?? ""}</p>
      `;
      break;

    case "tajo_abierto":
      html = `
        <h4>🪨 Tajo Abierto</h4>
        <p>Banco: ${data.banco ?? ""}</p>
        <p>Fase: ${data.fase ?? ""}</p>
        <p>Frente: ${data.frente ?? ""}</p>
        <p>Coordenadas GPS: ${data.coordGPS ?? ""}</p>
      `;
      break;

    case "aluvial":
      html = `
        <h4>💧 Aluvial (placer)</h4>
        <p>Mina: ${data.mina ?? ""}</p>
        <p>Río: ${data.rio ?? ""}</p>
        <p>Tramo: ${data.tramo ?? ""}</p>
        <p>Cuadrante: ${data.cuadrante ?? ""}</p>
        <p>Coordenadas GPS: ${data.coordGPS ?? ""}</p>
      `;
      break;

    case "cantera":
      html = `
        <h4>🏗️ Cantera</h4>
        <p>Cantera: ${data.cantera ?? ""}</p>
        <p>Material: ${data.material ?? ""}</p>
        <p>Frente: ${data.frente ?? ""}</p>
        <p>Coordenadas GPS: ${data.coordGPS ?? ""}</p>
        <p>Polígono: ${data.poligono ?? ""}</p>
      `;
      break;

    case "pirquen":
      html = `
        <h4>🧰 Pirquén / Artesanal</h4>
        <p>Faena: ${data.faena ?? ""}</p>
        <p>Tipo de explotación: ${data.tipoExplotacion ?? ""}</p>
        <p>Sector: ${data.sector ?? ""}</p>
        <p>Coordenadas: ${data.coordGPS ?? ""}</p>
        <p>Nivel (si aplica): ${data.nivel ?? ""}</p>
      `;
      break;

    default:
      html = "<p>Tipo de mina no especificado.</p>";
  }

  container.innerHTML = html;
}

// ================================================
// GUARDAR MEDICIÓN MANUAL EN HISTORIAL
// ================================================
function guardarMedicionActual(deviceId) {
  const container = document.getElementById("deviceData");
  if (!container) return;

  const timestamp = Date.now();
  const newData = {
    CO: Number(container.dataset.CO),
    CO2: Number(container.dataset.CO2),
    PM10: Number(container.dataset.PM10),
    PM2_5: Number(container.dataset.PM2_5),
    humedad: Number(container.dataset.humedad),
    temperatura: Number(container.dataset.temperatura)
  };

  set(ref(db, `dispositivos/${deviceId}/historial_global/${timestamp}`), newData)
    .then(() => alert("Medición guardada correctamente!"))
    .catch(err => console.error(err));
}

// ================================================
// VISTA HISTORIAL COMPLETO
// ================================================
function showHistoricalPage(deviceId) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Historial Completo del Dispositivo</h2>
      <p><strong>ID:</strong> ${deviceId}</p>

      <!-- ================================================
           BARRA DE BOTONES DE HISTORIAL (ACTUALIZADA)
           ================================================ -->
      <div class="actions">
          <button id="backToDeviceBtn">⬅️ Volver</button>
          <button id="refreshHistBtn">🔄 Actualizar historial</button>
          <button id="savePdfBtn" disabled>💾 Guardar PDF</button>
          <button id="saveExcelBtn" disabled>📊 Guardar Excel</button>
          <button id="page1Btn">📄 Página 1</button>
          <button id="manualPageBtn">📋 Abrir Historial Manager</button>
          <button id="page2Btn">📄 Página 2</button>

          <!-- 🔹 NUEVOS BOTONES AÑADIDOS -->
          <button id="userFormBtn">👤 Datos Personales</button>
          <button id="tipoMinaBtn">⛏️ Tipo de Mina</button>
          <button id="geoEmpresaBtn">🌍 Geo / Empresa</button>
      </div>

      <div id="fullHistorialContainer" class="historialDetails">Cargando historial...</div>
    </div>
  `;

  const fullHistorialDiv = document.getElementById("fullHistorialContainer");
  const savePdfBtn = document.getElementById("savePdfBtn");
  const saveExcelBtn = document.getElementById("saveExcelBtn");

  // ================================================
  // EVENTOS DE LOS BOTONES
  // ================================================
  document.getElementById("backToDeviceBtn").onclick = () => showDevices();
  document.getElementById("refreshHistBtn").onclick = () =>
    cargarHistorialGlobal(deviceId, fullHistorialDiv, savePdfBtn, saveExcelBtn);
  document.getElementById("page1Btn").onclick = () => showPage1(deviceId);
  document.getElementById("page2Btn").onclick = () => showPage2(deviceId);
  document.getElementById("manualPageBtn").onclick = () =>
    showHistoryManagerPage();

  // 🔹 NUEVOS BOTONES DE NAVEGACIÓN
  document.getElementById("userFormBtn").onclick = () => navigate("userform");
  document.getElementById("tipoMinaBtn").onclick = () => navigate("tipomina");
  document.getElementById("geoEmpresaBtn").onclick = () => navigate("geoempresa");

  cargarHistorialGlobal(deviceId, fullHistorialDiv, savePdfBtn, saveExcelBtn);
}

// ================================================
// RESTO DE FUNCIONES (SIN CAMBIOS)
// ================================================
function showPage1(deviceId) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Página 1 del Historial - ${deviceId}</h2>
      <button id="backToHistBtn">⬅️ Volver</button>
      <p>Aquí puedes mostrar gráficos o estadísticas detalladas.</p>
    </div>
  `;
  document.getElementById("backToHistBtn").onclick = () =>
    showHistoricalPage(deviceId);
}

function showPage2(deviceId) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Página 2 del Historial - ${deviceId}</h2>
      <button id="backToHistBtn">⬅️ Volver</button>
      <p>Aquí puedes mostrar comparativas o resúmenes del sensor.</p>
    </div>
  `;
  document.getElementById("backToHistBtn").onclick = () =>
    showHistoricalPage(deviceId);
}

function cargarHistorialGlobal(deviceId, container, btnPDF, btnExcel) {
  const histRef = ref(db, `dispositivos/${deviceId}/historial_global`);
  onValue(histRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      container.innerHTML = "<p>No hay datos históricos para mostrar.</p>";
      btnPDF.disabled = true;
      btnExcel.disabled = true;
      return;
    }

    const registros = Object.entries(data).reverse();
    container.innerHTML = "<h4>Registros del historial global:</h4>";
    registros.forEach(([id, valores]) => {
      container.innerHTML += `
        <div class="historialItem">
          <p><b>ID Registro:</b> ${id}</p>
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

function guardarHistorialComoPDF(deviceId, registros) {
  if (typeof window.jspdf === "undefined") {
    alert("Error: La librería jsPDF no está disponible.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Historial Global - ${deviceId}`, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleString("es-CL")}`, 14, 30);

  let y = 40;
  registros.forEach(([id, valores]) => {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(`ID: ${id}`, 14, y); y += 7;
    doc.text(
      `CO: ${valores.CO ?? "—"} | CO₂: ${valores.CO2 ?? "—"} | PM10: ${valores.PM10 ?? "—"} | PM2.5: ${valores.PM2_5 ?? "—"}`,
      14, y
    );
    y += 6;
    doc.text(
      `Humedad: ${valores.humedad ?? "—"}% | Temperatura: ${valores.temperatura ?? "—"} °C`,
      14, y
    );
    y += 10;
  });

  doc.save(`historial-global-${deviceId}.pdf`);
}

function guardarHistorialComoExcel(deviceId, registros) {
  let csv = "ID,CO,CO2,PM10,PM2_5,Humedad,Temperatura\n";
  registros.forEach(([id, valores]) => {
    csv += `${id},${valores.CO ?? ""},${valores.CO2 ?? ""},${valores.PM10 ?? ""},${valores.PM2_5 ?? ""},${valores.humedad ?? ""},${valores.temperatura ?? ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `historial-global-${deviceId}.csv`;
  link.click();
}
