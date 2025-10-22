// ================================================
// IMPORTACIONES Y CONFIGURACIÓN
// ================================================
import {
  auth, db, firestore, ref, onValue, get, remove, onAuthStateChanged, set
} from "../firebaseConfig.js";

import { doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";
import { showHistoryManagerPage } from "./historyManager.js";
import { showPagina1, showPagina2 } from "./paginas.js";

// ================================================
// NAV / MENÚ PRINCIPAL
// ================================================
export function showNav() {
  const navRoot = document.getElementById("nav");
  if(!navRoot) return console.error("No existe el contenedor #nav en el HTML");
  navRoot.innerHTML = `
    <nav class="navbar">
      <button id="btnAdmin">🏠 Dashboard Admin</button>
      <button id="btnUser">👤 Perfil Usuario</button>
      <button id="btnDevices">📱 Dispositivos</button>
      <button id="btnAlerts">⚠️ Alertas</button>
      <button id="btnHistory">📜 Historial General</button>
      <button id="btnLogout">🔓 Cerrar Sesión</button>
    </nav>
  `;

  document.getElementById("btnAdmin").onclick = () => navigate("admin");
  document.getElementById("btnUser").onclick = () => navigate("user");
  document.getElementById("btnDevices").onclick = () => showDevices();
  document.getElementById("btnHistory").onclick = () => showHistoricalPage("device_A4CB2F124B00");
  document.getElementById("btnLogout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };
}

// ================================================
// PANEL ADMINISTRADOR
// ================================================
export function showAdminDashboard() {
  showNav();
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Panel del Administrador</h2>
      <div id="users"></div>
      <div class="actions">
        <button id="historyBtn">📜 Historial General</button>
        <button id="nuevoBtnAdmin">✨ Nuevo Botón</button>
        <button id="pagina1Btn">📄 Página 1</button>
        <button id="pagina2Btn">📄 Página 2</button>
      </div>
    </div>
  `;
  const usersRef = ref(db, "usuarios");
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val() || {};
    const container = document.getElementById("users");
    container.innerHTML = "<h3>Usuarios Registrados:</h3>";
    for (let id in data) {
      const user = data[id];
      const rolTexto = user.isAdmin ? "Administrador" : "Usuario Normal";
      container.innerHTML += `<p>👤 ${user.nombre || "Sin nombre"} (${user.email}) - <b>${rolTexto}</b></p>`;
    }
  });
  document.getElementById("historyBtn").onclick = () => showHistoricalPage("device_A4CB2F124B00");
  document.getElementById("nuevoBtnAdmin").onclick = () => showHistoryManagerPage();
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();
}

// ================================================
// DASHBOARD USUARIO
// ================================================
export function showUserDashboard() {
  showNav();
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile">Cargando datos...</div>
      <button id="editProfileBtn">✏️ Editar Perfil</button>
      <button id="viewDevicesBtn">📱 Ver Dispositivo</button>
    </div>
  `;
  document.getElementById("viewDevicesBtn").onclick = () => showDevices();
  onAuthStateChanged(auth, async (user) => {
    if(!user) return root.innerHTML="<p>No hay usuario autenticado.</p>";
    const userDocRef = doc(firestore,"users",user.uid);
    onSnapshot(userDocRef,(docSnap)=>{
      const data = docSnap.exists()?docSnap.data():{};
      document.getElementById("userProfile").innerHTML=`
        <p><b>Nombre:</b> ${data.nombre||"No registrado"}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Teléfono:</b> ${data.telefono||"-"}</p>
        <p><b>Dispositivo ID:</b> ${data.deviceId||"No asignado"}</p>
      `;
    });
  });
}

// ================================================
// DISPOSITIVOS Y HISTORIAL
// ================================================
const DEVICE_ID_DEFAULT = "device_A4CB2F124B00";
export function showDevices() {
  showNav();
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Dispositivo Asignado</h2>
      <div class="actions">
        <button id="back">⬅️ Volver</button>
        <button id="refreshBtn">🔄 Actualizar datos</button>
        <button id="verHistorialBtn">📜 Ver historial completo</button>
        <button id="saveCurrentBtn">💾 Guardar medición</button>
      </div>
      <div id="deviceData" class="deviceDetails">Cargando dispositivo...</div>
    </div>
  `;
  const deviceDataDiv = document.getElementById("deviceData");
  document.getElementById("back").onclick = () => showUserDashboard();
  document.getElementById("refreshBtn").onclick = () => mostrarDatosDispositivo(DEVICE_ID_DEFAULT, deviceDataDiv);
  document.getElementById("verHistorialBtn").onclick = () => showHistoricalPage(DEVICE_ID_DEFAULT);
  document.getElementById("saveCurrentBtn").onclick = () => guardarMedicionActual(DEVICE_ID_DEFAULT);
  mostrarDatosDispositivo(DEVICE_ID_DEFAULT, deviceDataDiv);
}

function mostrarDatosDispositivo(deviceId, container) {
  const deviceRef = ref(db, `dispositivos/${deviceId}`);
  onValue(deviceRef, (snapshot) => {
    const d = snapshot.val();
    if(!d) return container.innerHTML=`<p>No se encontró ningún dispositivo con ID: <b>${deviceId}</b></p>`;
    container.dataset.CO = d.CO ?? 0;
    container.dataset.CO2 = d.CO2 ?? 0;
    container.dataset.PM10 = d.PM10 ?? 0;
    container.dataset.PM2_5 = d.PM2_5 ?? 0;
    container.dataset.humedad = d.humedad ?? 0;
    container.dataset.temperatura = d.temperatura ?? 0;
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
  });
}

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
// HISTORIAL COMPLETO
// ================================================
function showHistoricalPage(deviceId) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Historial Completo del Dispositivo</h2>
      <p><b>ID:</b> ${deviceId}</p>
      <div class="actions">
        <button id="backToDeviceBtn">⬅️ Volver</button>
        <button id="refreshHistBtn">🔄 Actualizar historial</button>
        <button id="savePdfBtn" disabled>💾 Guardar PDF</button>
        <button id="saveExcelBtn" disabled>📊 Guardar Excel</button>
        <button id="page1Btn">📄 Página 1</button>
        <button id="page2Btn">📄 Página 2</button>
        <button id="manualPageBtn">📋 Abrir Historial Manager</button>
      </div>
      <div id="fullHistorialContainer" class="historialDetails">Cargando historial...</div>
    </div>
  `;
  const fullHistorialDiv = document.getElementById("fullHistorialContainer");
  const btnPDF = document.getElementById("savePdfBtn");
  const btnExcel = document.getElementById("saveExcelBtn");
  document.getElementById("backToDeviceBtn").onclick = () => showDevices();
  document.getElementById("refreshHistBtn").onclick = () => cargarHistorialGlobal(deviceId, fullHistorialDiv, btnPDF, btnExcel);
  document.getElementById("page1Btn").onclick = () => showPagina1(deviceId);
  document.getElementById("page2Btn").onclick = () => showPagina2(deviceId);
  document.getElementById("manualPageBtn").onclick = () => showHistoryManagerPage();
  cargarHistorialGlobal(deviceId, fullHistorialDiv, btnPDF, btnExcel);
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
    container.innerHTML = "";
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
  if (typeof window.jspdf === "undefined") { alert("jsPDF no está disponible."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`Historial Global - ${deviceId}`, 14, 22);
  let y = 40;
  registros.forEach(([id, valores]) => {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(`ID: ${id}`, 14, y); y+=7;
    doc.text(`CO: ${valores.CO??"—"} | CO₂: ${valores.CO2??"—"} | PM10: ${valores.PM10??"—"} | PM2.5: ${valores.PM2_5??"—"}`,14,y); y+=6;
    doc.text(`Humedad: ${valores.humedad??"—"}% | Temp: ${valores.temperatura??"—"} °C`,14,y); y+=10;
  });
  doc.save(`historial-global-${deviceId}.pdf`);
}

function guardarHistorialComoExcel(deviceId, registros) {
  let csv = "ID,CO,CO2,PM10,PM2_5,Humedad,Temperatura\n";
  registros.forEach(([id,valores])=>{
    csv+=`${id},${valores.CO??""},${valores.CO2??""},${valores.PM10??""},${valores.PM2_5??""},${valores.humedad??""},${valores.temperatura??""}\n`;
  });
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const link = document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download=`historial-global-${deviceId}.csv`;
  link.click();
}
