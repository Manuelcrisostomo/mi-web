// ================================================
// IMPORTACIONES Y CONFIGURACIÓN
// ================================================
import {
  auth,
  db,
  firestore,
  ref,
  onValue,
  get,
  remove,
  onAuthStateChanged
} from "../firebaseConfig.js";

import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";
import { showHistoryUtilsPage } from "./historyUtils.js";
import { showNewHistoryPage } from "./Histors.js";
import { showPagina1, showPagina2 } from "./paginas.js";
import { showHistoryManagerPage } from "./historyManager.js";
import { showDevices } from "./showDevices.js";

// ================================================
// PANEL ADMINISTRADOR
// ================================================
export function showAdminDashboard() {
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
        <button id="logout">Cerrar Sesión</button>
      </div>
    </div>
  `;

  const usersRef = ref(db, "usuarios");
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    const container = document.getElementById("users");
    container.innerHTML = "<h3>Usuarios Registrados:</h3>";
    for (let id in data) {
      const user = data[id];
      const rolTexto = user.isAdmin ? "Administrador" : "Usuario Normal";
      container.innerHTML += `<p>👤 ${user.nombre || "Sin nombre"} (${user.email}) - <b>${rolTexto}</b></p>`;
    }
  });

  document.getElementById("logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };
  document.getElementById("historyBtn").onclick = () => showHistoryUtilsPage();
  document.getElementById("nuevoBtnAdmin").onclick = () => showNewHistoryPage();
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();
  document.getElementById("manualPageBtn")?.onclick = () => showHistoryManagerPage();
}

// ================================================
// DASHBOARD USUARIO (ROL ELIMINADO)
// ================================================
export function showUserDashboard() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card">Cargando datos...</div>

      <form id="editForm" class="card">
        <h3>Datos Personales</h3>
        <label>Nombre:</label><input type="text" id="nombre" />
        <label>Teléfono:</label><input type="text" id="telefono" />
        <label>Dirección:</label><input type="text" id="direccion" />
        <label>ID del Dispositivo:</label><input type="text" id="deviceId" />

        <h3>Tipo de Mina</h3>
        <select id="tipoMina">
          <option value="">Seleccione tipo de mina</option>
          <option value="subterranea">Subterránea</option>
          <option value="tajo_abierto">Tajo Abierto</option>
          <option value="aluvial">Aluvial</option>
          <option value="cantera">Cantera</option>
          <option value="pirqen">Pirquén / artesanal</option>
        </select>
        <div id="camposMinaDinamicos"></div>

        <h3>Datos Técnicos</h3>
        <label>Latitud:</label><input type="number" id="latitude" step="any" />
        <label>Longitud:</label><input type="number" id="longitude" step="any" />
        <label>Altitud (m):</label><input type="number" id="altitude" step="any" />
        <label>Precisión (m):</label><input type="number" id="precision" step="any" />
        <label>EPSG/WGS84:</label><input type="text" id="EPSG" placeholder="WGS84" />

        <h3>Datos Geográficos</h3>
        <label>País:</label><input type="text" id="pais" />
        <label>Región:</label><input type="text" id="region" />
        <label>Comuna:</label><input type="text" id="comuna" />
        <label>Empresa:</label><input type="text" id="nombreEmpresa" />

        <button type="submit">💾 Guardar Cambios</button>
        <button type="button" id="deleteUser" class="delete-btn">🗑️ Borrar Usuario</button>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card">Cargando dispositivo...</div>

      <div class="actions">
        <button id="alertsBtn">Ver Alertas</button>
        <button id="devicesBtn">Ver Dispositivos</button>
        <button id="historyBtn">📜 Ver Historial</button>
        <button id="nuevoBtnUser">✨ Nuevo Botón</button>
        <button id="pagina1Btn">📄 Página 1</button>
        <button id="pagina2Btn">📄 Página 2</button>
        <button id="logoutBtn">Cerrar Sesión</button>
      </div>
    </div>
  `;

  const tipoMinaSelect = document.getElementById("tipoMina");
  const camposMinaDiv = document.getElementById("camposMinaDinamicos");
  tipoMinaSelect.addEventListener("change", () => {
    const tipo = tipoMinaSelect.value;
    let html = "";
    switch (tipo) {
      case "subterranea":
        html = `
          <label>Zona:</label><input id="zona" />
          <label>Rampa:</label><input id="rampa" />
          <label>Galería:</label><input id="galeria" />
          <label>Sector:</label><input id="sector" />
          <label>Nombre estación:</label><input id="nombreEstacion" />`;
        break;
      case "tajo_abierto":
        html = `
          <label>Banco:</label><input id="banco" />
          <label>Frente:</label><input id="frente" />
          <label>Zona:</label><input id="zona" />`;
        break;
      case "cantera":
        html = `
          <label>Cantera:</label><input id="cantera" />
          <label>Material:</label><input id="material" />`;
        break;
    }
    camposMinaDiv.innerHTML = html;
  });

  // Eventos
  document.getElementById("logoutBtn").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("historyBtn").onclick = () => showHistoryUtilsPage();
  document.getElementById("nuevoBtnUser").onclick = () => showNewHistoryPage();
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();

  // Cargar usuario autenticado
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");
    const userId = user.uid;
    const userDocRef = doc(firestore, "users", userId);
    onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Correo:</b> ${user.email}</p>
        <p><b>Teléfono:</b> ${data.telefono || "-"}</p>
        <p><b>Dirección:</b> ${data.direccion || "-"}</p>
        <p><b>ID Dispositivo:</b> ${data.deviceId || "-"}</p>
      `;
      ["nombre", "telefono", "direccion", "deviceId", "latitude", "longitude", "altitude",
        "precision", "EPSG", "pais", "region", "comuna", "nombreEmpresa"
      ].forEach(f => {
        const el = document.getElementById(f);
        if (el) el.value = data[f] || "";
      });
      if (data.deviceId) mostrarDatosDispositivo(data.deviceId);
    });

    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();
      const newData = {};
      ["nombre", "telefono", "direccion", "deviceId", "latitude", "longitude", "altitude",
        "precision", "EPSG", "pais", "region", "comuna", "nombreEmpresa"
      ].forEach(f => {
        const el = document.getElementById(f);
        if (el) newData[f] = el.value.trim();
      });
      try {
        await setDoc(userDocRef, newData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), newData);
        alert("✅ Datos actualizados correctamente.");
      } catch (err) {
        alert(`❌ Error: ${err.message}`);
      }
    };

    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Eliminar usuario?")) return;
      await deleteDoc(userDocRef);
      await remove(ref(db, `usuarios/${userId}`));
      alert("🗑️ Usuario eliminado.");
      navigate("login");
    };
  });
}

// ================================================
// FUNCIONES DE DISPOSITIVOS
// ================================================
function mostrarDatosDispositivo(deviceId) {
  const container = document.getElementById("deviceData");
  const deviceRef = ref(db, `dispositivos/${deviceId}`);
  onValue(deviceRef, (snap) => {
    const d = snap.val();
    if (!d) return (container.innerHTML = `<p>No existe el dispositivo ${deviceId}</p>`);
    container.innerHTML = `
      <p><b>ID:</b> ${deviceId}</p>
      <p>CO: ${d.CO ?? 0} ppm</p>
      <p>CO₂: ${d.CO2 ?? 0} ppm</p>
      <p>PM10: ${d.PM10 ?? 0}</p>
      <p>PM2.5: ${d.PM2_5 ?? 0}</p>
      <button id="verHistorialBtn2">📜 Ver historial completo</button>`;
    document.getElementById("verHistorialBtn2").onclick = () => showHistoricalPage(deviceId);
  });
}

// ================================================
// HISTORIAL COMPLETO Y EXPORTACIÓN EXCEL MULTIHOJA
// ================================================
export function showHistoricalPage(deviceId) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Historial Completo del Dispositivo</h2>
      <p><b>ID:</b> ${deviceId}</p>
      <div class="actions">
        <button id="exportExcelBtn" disabled>💾 Exportar a Excel</button>
        <button id="backToDeviceBtn">Volver</button>
      </div>
      <h3>Historial local</h3>
      <div id="historialContainer"></div>
      <h3>Historial global</h3>
      <div id="historialGlobalContainer"></div>
    </div>
  `;

  document.getElementById("backToDeviceBtn").onclick = () => showDevices();

  const historialDiv = document.getElementById("historialContainer");
  const globalDiv = document.getElementById("historialGlobalContainer");
  const exportBtn = document.getElementById("exportExcelBtn");

  let registrosLocal = [];
  let registrosGlobal = [];

  onValue(ref(db, `dispositivos/${deviceId}/historial`), (snap) => {
    registrosLocal = Object.entries(snap.val() || {});
    historialDiv.innerHTML = registrosLocal
      .map(([t, v]) => `<p>${new Date(+t).toLocaleString()} | CO:${v.CO ?? "-"} | CO₂:${v.CO2 ?? "-"}</p>`)
      .join("");
    exportBtn.disabled = registrosLocal.length === 0 && registrosGlobal.length === 0;
  });

  onValue(ref(db, `dispositivos/${deviceId}/historial_global`), (snap) => {
    registrosGlobal = Object.entries(snap.val() || {});
    globalDiv.innerHTML = registrosGlobal
      .map(([t, v]) => `<p>${new Date(+t).toLocaleString()} | PM10:${v.PM10 ?? "-"} | Temp:${v.temperatura ?? "-"}</p>`)
      .join("");
    exportBtn.disabled = registrosLocal.length === 0 && registrosGlobal.length === 0;
  });

  exportBtn.onclick = () => exportToExcelMultiSheet(deviceId, registrosLocal, registrosGlobal);
}

// ================================================
// EXPORTAR HISTORIAL A EXCEL MULTIHOJA (CSV)
// ================================================
async function exportToExcelMultiSheet(deviceId, local, global) {
  let csv = "Fecha,CO,CO2,PM10,PM2.5,Humedad,Temp,Tipo\n";
  const rows = [...local.map(([t, v]) => [t, v, "local"]), ...global.map(([t, v]) => [t, v, "global"])];
  rows.forEach(([t, v, tipo]) => {
    csv += `"${new Date(+t).toLocaleString()}",${v.CO ?? ""},${v.CO2 ?? ""},${v.PM10 ?? ""},${v.PM2_5 ?? ""},${v.humedad ?? ""},${v.temperatura ?? ""},${tipo}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `historial_${deviceId}.csv`;
  link.click();
}
