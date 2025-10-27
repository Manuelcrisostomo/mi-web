// ================================================
// userDashboard.js — Gestión de Usuario y Tipos de Mina
// ================================================

import {
  auth,
  db,
  firestore,
  ref,
  onValue,
  remove,
  get,
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

export function showUserDashboard() {
  const root = document.getElementById("root");

  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card"></div>

      <h3>Editar Datos del Usuario</h3>
      <form id="editForm" class="card">

        <h4>Datos Personales</h4>
        <label>Nombre:</label><input type="text" id="nombre" placeholder="Nombre completo" />
        <label>Teléfono:</label><input type="text" id="telefono" placeholder="Teléfono" />
        <label>Dirección:</label><input type="text" id="direccion" placeholder="Dirección" />
        <label>ID del Dispositivo:</label><input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" />
        <label>Rol:</label>
        <select id="isAdmin">
          <option value="false">Usuario Normal</option>
          <option value="true">Administrador</option>
        </select>

        <h4>Tipo de Mina</h4>
        <select id="tipoMina">
          <option value="">Seleccione tipo...</option>
          <option value="subterranea">⛏️ Subterránea</option>
          <option value="tajo_abierto">🪨 Tajo Abierto</option>
          <option value="aluvial">💧 Aluvial (placer)</option>
          <option value="cantera">🏗️ Cantera</option>
          <option value="pirquen">🧰 Pirquén / Artesanal</option>
        </select>

        <div id="camposMina"></div>

        <h4>Datos Técnicos (Mapas/Sistema)</h4>
        <label>Latitud:</label><input type="number" step="0.000001" id="techLat" placeholder="Latitud" />
        <label>Longitud:</label><input type="number" step="0.000001" id="techLng" placeholder="Longitud" />
        <label>Altitud (m):</label><input type="number" step="0.1" id="techAlt" placeholder="Altitud" />
        <label>Precisión (m):</label><input type="number" step="0.01" id="techPrecision" placeholder="Precisión" />
        <label>EPSG/WGS84:</label><input type="text" id="techEPSG" placeholder="EPSG/WGS84" />

        <h4>Datos Geográficos / Empresariales</h4>
        <label>País:</label><input type="text" id="geoPais" placeholder="País" />
        <label>Región:</label><input type="text" id="geoRegion" placeholder="Región" />
        <label>Comuna:</label><input type="text" id="geoComuna" placeholder="Comuna" />
        <label>Nombre de la mina:</label><input type="text" id="geoMina" placeholder="Nombre de la mina" />
        <label>Nombre de la empresa:</label><input type="text" id="geoEmpresa" placeholder="Nombre de la empresa" />

        <button type="submit">💾 Guardar Cambios</button>
        <button type="button" id="deleteUser" class="delete-btn">🗑️ Borrar Usuario</button>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card">Cargando dispositivo...</div>

      <!-- ================================================
           BARRA DE BOTONES DE ACCIÓN (ACTUALIZADA)
           ================================================ -->
      <div class="actions">
        <button id="alertsBtn">Ver Alertas</button>
        <button id="devicesBtn">Ver Dispositivos</button>

        <!-- 🔹 NUEVOS BOTONES AÑADIDOS AL LADO DEL CIERRE DE SESIÓN -->
        <button id="userFormBtn">👤 Datos Personales</button>
        <button id="tipoMinaBtn">⛏️ Tipo de Mina</button>
        <button id="geoEmpresaBtn">🌍 Geo / Empresa</button>

        <button id="logout">Cerrar Sesión</button>
      </div>
    </div>
  `;

  // ================================================
  // EVENTOS DE NAVEGACIÓN
  // ================================================
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");

  // 🔹 NUEVOS BOTONES: ENLAZAN A LAS NUEVAS PESTAÑAS
  document.getElementById("userFormBtn").onclick = () => navigate("userform");
  document.getElementById("tipoMinaBtn").onclick = () => navigate("tipomina");
  document.getElementById("geoEmpresaBtn").onclick = () => navigate("geoempresa");

  document.getElementById("logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // ================================================
  // RENDERIZAR CAMPOS SEGÚN TIPO DE MINA
  // ================================================
  const camposMinaDiv = document.getElementById("camposMina");
  const tipoSelect = document.getElementById("tipoMina");

  function renderCampos(tipo) {
    let html = "";
    switch (tipo) {
      case "subterranea":
        html = `
          <h4>⛏️ Subterránea</h4>
          <label>Zona:</label><input id="zona" placeholder="Zona" />
          <label>Rampa:</label><input id="rampa" placeholder="Rampa" />
          <label>Galería:</label><input id="galeria" placeholder="Galería" />
          <label>Sector:</label><input id="sector" placeholder="Sector" />
          <label>Nombre de estación:</label><input id="nombreEstacion" placeholder="Nombre estación" />
        `;
        break;
      case "tajo_abierto":
        html = `
          <h4>🪨 Tajo Abierto</h4>
          <label>Banco:</label><input id="banco" placeholder="Banco" />
          <label>Fase:</label><input id="fase" placeholder="Fase" />
          <label>Frente:</label><input id="frente" placeholder="Frente" />
          <label>Coordenadas GPS:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
        `;
        break;
      case "aluvial":
        html = `
          <h4>💧 Aluvial (placer)</h4>
          <label>Mina:</label><input id="mina" placeholder="Mina" />
          <label>Río:</label><input id="rio" placeholder="Río" />
          <label>Tramo:</label><input id="tramo" placeholder="Tramo" />
          <label>Cuadrante:</label><input id="cuadrante" placeholder="Cuadrante" />
          <label>Coordenadas GPS:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
        `;
        break;
      case "cantera":
        html = `
          <h4>🏗️ Cantera</h4>
          <label>Cantera:</label><input id="cantera" placeholder="Cantera" />
          <label>Material:</label><input id="material" placeholder="Material" />
          <label>Frente:</label><input id="frente" placeholder="Frente" />
          <label>Coordenadas GPS:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
          <label>Polígono:</label><input id="poligono" placeholder="Polígono" />
        `;
        break;
      case "pirquen":
        html = `
          <h4>🧰 Pirquén / Artesanal</h4>
          <label>Faena:</label><input id="faena" placeholder="Faena" />
          <label>Tipo de explotación:</label><input id="tipoExplotacion" placeholder="Tipo de explotación" />
          <label>Sector:</label><input id="sector" placeholder="Sector" />
          <label>Coordenadas:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
          <label>Nivel (si aplica):</label><input id="nivel" placeholder="Nivel" />
        `;
        break;
      default:
        html = "";
    }
    camposMinaDiv.innerHTML = html;
  }

  tipoSelect.addEventListener("change", (e) => renderCampos(e.target.value));

  // ================================================
  // CARGA DE DATOS DE USUARIO DESDE FIREBASE
  // ================================================
  onAuthStateChanged(auth, async (user) => {
    if (!user) return root.innerHTML = "<p>No hay usuario autenticado.</p>";

    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore, "users", userId);

    onSnapshot(userDocRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Email:</b> ${userEmail}</p>
        <p><b>Rol:</b> ${data.isAdmin ? "Administrador" : "Usuario"}</p>
        <p><b>Tipo de mina:</b> ${data.tipoMina || "-"}</p>
      `;
      tipoSelect.value = data.tipoMina || "";
      renderCampos(tipoSelect.value);
    });

    // --- Guardar datos ---
    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();

      const tipoMina = tipoSelect.value;
      const camposExtras = {};
      camposMinaDiv.querySelectorAll("input").forEach(input => {
        camposExtras[input.id] = input.value.trim();
      });

      const updatedData = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        deviceId: document.getElementById("deviceId").value.trim(),
        isAdmin: document.getElementById("isAdmin").value === "true",
        tipoMina,
        ...camposExtras,
        latitude: parseFloat(document.getElementById("techLat").value) || 0,
        longitude: parseFloat(document.getElementById("techLng").value) || 0,
        altitude: parseFloat(document.getElementById("techAlt").value) || 0,
        precision: parseFloat(document.getElementById("techPrecision").value) || 0,
        EPSG: document.getElementById("techEPSG").value.trim() || "WGS84",
        pais: document.getElementById("geoPais").value.trim(),
        region: document.getElementById("geoRegion").value.trim(),
        comuna: document.getElementById("geoComuna").value.trim(),
        nombreMina: document.getElementById("geoMina").value.trim(),
        nombreEmpresa: document.getElementById("geoEmpresa").value.trim(),
        email: userEmail,
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(userDocRef, updatedData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), updatedData);
        alert("✅ Datos guardados correctamente");
      } catch (err) {
        alert("❌ Error al guardar: " + err.message);
      }
    };

    // --- Eliminar usuario ---
    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Eliminar usuario permanentemente?")) return;
      try {
        await deleteDoc(userDocRef);
        await remove(ref(db, `usuarios/${userId}`));
        alert("🗑️ Usuario eliminado");
        navigate("login");
      } catch (err) {
        alert("❌ Error al eliminar: " + err.message);
      }
    };
  });
}


    // Mostrar datos del dispositivo
    function mostrarDatosDispositivo(deviceId, container = document.getElementById("deviceData")) {
      const deviceRef = ref(db, `dispositivos/${deviceId}`);
      onValue(deviceRef, (snapshot) => {
        const d = snapshot.val();
        if (!d) return (container.innerHTML = `<p>No se encontró el dispositivo <b>${deviceId}</b></p>`);
        container.innerHTML = `
          <p><b>ID:</b> ${deviceId}</p>
          <p><b>Nombre:</b> ${d.name || "Desconocido"}</p>
          <p><b>Usuario:</b> ${d.userEmail || "Sin asignar"}</p>
          <p><b>Latitud:</b> ${d.latitude ?? 0}</p>
          <p><b>Longitud:</b> ${d.longitude ?? 0}</p>
          <p><b>Altitud (m):</b> ${d.altitude ?? 0}</p>
          <p><b>Precisión (m):</b> ${d.precision ?? 0}</p>
          <button id="verHistorialBtn2">📜 Ver historial completo</button>
        `;
        document.getElementById("verHistorialBtn2").onclick = () => showHistoricalPage(deviceId);
      });
    }
 
// ================================================
// Resto de funciones de dispositivos, historial y exportación
// ================================================
// Puedes reutilizar funciones existentes: showHistoricalPage(deviceId), showHistoryUtilsPage(), etc.


// ================================================
// DISPOSITIVOS
// ================================================
export function showDevices() {
  const root = document.getElementById("root");
  root.innerHTML = `y
    <div class="dashboard">
      <h2>Dispositivo Asignado</h2>
      <div id="deviceData" class="deviceDetails">Cargando dispositivo...</div>
      <div class="actions">
        <button id="verTodosBtn">Ver todos los dispositivos</button>
        <button id="nuevoBtnDispositivo">✨ Nuevo Botón</button>
      </div>
    </div>
  `;

  document.getElementById("verTodosBtn").onclick = () => showAllDevices();
  document.getElementById("nuevoBtnDispositivo").onclick = () => showNewHistoryPage();

  onAuthStateChanged(auth, (user) => {
    if (!user) return (document.getElementById("deviceData").innerHTML = "<p>No hay usuario autenticado.</p>");

    const userRef = ref(db, `usuarios/${user.uid}`);
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (!userData || !userData.deviceId)
        return (document.getElementById("deviceData").innerHTML = "<p>No tienes dispositivos asignados.</p>");
      mostrarDatosDispositivo(userData.deviceId, document.getElementById("deviceData"));
    });
  });
}

// ================================================
// FUNCIONES DE DISPOSITIVOS E HISTORIALES
// ================================================
function mostrarDatosDispositivo(deviceId, container) {
  const deviceRef = ref(db, `dispositivos/${deviceId}`);
  onValue(deviceRef, (snapshot) => {
    const d = snapshot.val();
    if (!d) return (container.innerHTML = `<p>No se encontró el dispositivo: <b>${deviceId}</b></p>`);

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
      <button id="verHistorialCompletoBtn">📄 Ver historial completo</button>
    `;
    mostrarHistorialCarrusel(deviceId);
    document.getElementById("verHistorialCompletoBtn").onclick = () => showHistoricalPage(deviceId);
  });
}

function mostrarHistorialCarrusel(deviceId) {
  const historialRef = ref(db, `dispositivos/${deviceId}/historial`);
  onValue(historialRef, (snapshot) => {
    const historial = snapshot.val();
    const carrusel = document.getElementById("historialCarrusel");
    carrusel.innerHTML = "";

    if (!historial) return (carrusel.innerHTML = "<p>No hay datos históricos.</p>");

    Object.entries(historial)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
      .slice(0, 12)
      .forEach(([ts, datos]) => {
        const card = document.createElement("div");
        card.className = "historialCard";
        card.innerHTML = `
          <p><b>${new Date(parseInt(ts)).toLocaleString()}</b></p>
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
}

// ================================================
// TODOS LOS DISPOSITIVOS
// ================================================
export function showAllDevices() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Todos los Dispositivos</h2>
      <div id="deviceList">Cargando dispositivos...</div>
      <button id="backBtn">Volver</button>
    </div>
  `;
  document.getElementById("backBtn").onclick = () => showDevices();

  const devicesRef = ref(db, "dispositivos");
  onValue(devicesRef, (snapshot) => {
    const devices = snapshot.val();
    const listDiv = document.getElementById("deviceList");
    if (!devices) return (listDiv.innerHTML = "<p>No hay dispositivos en la base de datos.</p>");
    listDiv.innerHTML = "<ul>";
    for (const id in devices) {
      const name = devices[id].name || `Dispositivo ${id}`;
      listDiv.innerHTML += `
        <li>${name} (ID: ${id})
          <button onclick="showHistoricalPage('${id}')">📜 Ver historial</button>
        </li>`;
    }
    listDiv.innerHTML += "</ul>";
  });
}

// ================================================
// HISTORIAL COMPLETO Y EXPORTACIÓN EXCEL
// ================================================
// ================================================
// HISTORIAL COMPLETO Y EXPORTACIÓN EXCEL
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
      <h3>Historial del dispositivo</h3>
      <div id="historialContainer" class="historialGrid">Cargando historial...</div>
      <h3>Historial global</h3>
      <div id="historialGlobalContainer" class="historialGrid">Cargando historial global...</div>
    </div>
  `;

  const historialDiv = document.getElementById("historialContainer");
  const historialGlobalDiv = document.getElementById("historialGlobalContainer");
  const exportExcelBtn = document.getElementById("exportExcelBtn");

  document.getElementById("backToDeviceBtn").onclick = () => showDevices();

  // --- Historial del dispositivo ---
  const historialRef = ref(db, `dispositivos/${deviceId}/historial`);
  onValue(historialRef, (snapshot) => {
    const data = snapshot.val() || {};
    historialDiv.innerHTML = "";
    const registros = Object.entries(data).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

    registros.forEach(([ts, valores]) => {
      const fecha = new Date(parseInt(ts)).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "medium" });
      const card = document.createElement("div");
      card.className = "historialCard";
      card.innerHTML = `
        <h4>${fecha}</h4>
        <p>CO: ${valores.CO ?? "—"} ppm</p>
        <p>CO₂: ${valores.CO2 ?? "—"} ppm</p>
        <p>PM10: ${valores.PM10 ?? "—"} µg/m³</p>
        <p>PM2.5: ${valores.PM2_5 ?? "—"} µg/m³</p>
        <p>Humedad: ${valores.humedad ?? "—"}%</p>
        <p>Temperatura: ${valores.temperatura ?? "—"} °C</p>
      `;
      historialDiv.appendChild(card);
    });

    exportExcelBtn.disabled = registros.length === 0;
    exportExcelBtn.onclick = () => exportToExcel(deviceId, registros);
  });

  // --- Historial global ---
  const historialGlobalRef = ref(db, `dispositivos/${deviceId}/historial_global`);
  onValue(historialGlobalRef, (snapshot) => {
    const data = snapshot.val() || {};
    historialGlobalDiv.innerHTML = "";
    const registrosGlobal = Object.entries(data).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

    registrosGlobal.forEach(([ts, valores]) => {
      const fecha = new Date(parseInt(ts)).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "medium" });
      const card = document.createElement("div");
      card.className = "historialCard";
      card.innerHTML = `
        <h4>${fecha}</h4>
        <p>CO: ${valores.CO ?? "—"} ppm</p>
        <p>CO₂: ${valores.CO2 ?? "—"} ppm</p>
        <p>PM10: ${valores.PM10 ?? "—"} µg/m³</p>
        <p>PM2.5: ${valores.PM2_5 ?? "—"} µg/m³</p>
        <p>Humedad: ${valores.humedad ?? "—"}%</p>
        <p>Temperatura: ${valores.temperatura ?? "—"} °C</p>
      `;
      historialGlobalDiv.appendChild(card);
    });
  });
}

// ================================================
// FUNCIONES AUXILIARES: EXPORTAR HISTORIAL A EXCEL
// ================================================
async function exportToExcel(deviceId, registros) {
  // Obtener email del usuario asignado
  let userEmail = "Sin asignar";
  try {
    const snapshot = await get(ref(db, "usuarios"));
    const usuarios = snapshot.val() || {};
    for (let uid in usuarios) {
      if (usuarios[uid].deviceId === deviceId) {
        userEmail = usuarios[uid].email || userEmail;
        break;
      }
    }
  } catch (err) {
    console.error("Error al obtener usuario:", err);
  }

  // Construir CSV
  let csv = "Fecha,CO,CO2,PM10,PM2.5,Humedad,Temperatura,Usuario,Dispositivo\n";
  registros.forEach(([ts, valores]) => {
    const fecha = new Date(parseInt(ts)).toLocaleString("es-CL");
    csv += `"${fecha}",${valores.CO ?? ""},${valores.CO2 ?? ""},${valores.PM10 ?? ""},${valores.PM2_5 ?? ""},${valores.humedad ?? ""},${valores.temperatura ?? ""},"${userEmail}","${deviceId}"\n`;
  });

  // Descargar CSV
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `historial_${deviceId}.csv`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
// ================================================
// HISTORIAL COMPLETO Y EXPORTACIÓN EXCEL CON DOS HOJAS
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
      <h3>Historial del dispositivo</h3>
      <div id="historialContainer" class="historialGrid">Cargando historial...</div>
      <h3>Historial global</h3>
      <div id="historialGlobalContainer" class="historialGrid">Cargando historial global...</div>
    </div>
  `;

  const historialDiv = document.getElementById("historialContainer");
  const historialGlobalDiv = document.getElementById("historialGlobalContainer");
  const exportExcelBtn = document.getElementById("exportExcelBtn");

  document.getElementById("backToDeviceBtn").onclick = () => showDevices();

  let registrosLocal = [];
  let registrosGlobal = [];

  // --- Historial del dispositivo ---
  const historialRef = ref(db, `dispositivos/${deviceId}/historial`);
  onValue(historialRef, (snapshot) => {
    const data = snapshot.val() || {};
    historialDiv.innerHTML = "";
    registrosLocal = Object.entries(data).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

    registrosLocal.forEach(([ts, valores]) => {
      const fecha = new Date(parseInt(ts)).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "medium" });
      const card = document.createElement("div");
      card.className = "historialCard";
      card.innerHTML = `
        <h4>${fecha}</h4>
        <p>CO: ${valores.CO ?? "—"} ppm</p>
        <p>CO₂: ${valores.CO2 ?? "—"} ppm</p>
        <p>PM10: ${valores.PM10 ?? "—"} µg/m³</p>
        <p>PM2.5: ${valores.PM2_5 ?? "—"} µg/m³</p>
        <p>Humedad: ${valores.humedad ?? "—"}%</p>
        <p>Temperatura: ${valores.temperatura ?? "—"} °C</p>
      `;
      historialDiv.appendChild(card);
    });

    exportExcelBtn.disabled = registrosLocal.length === 0 && registrosGlobal.length === 0;
  });

  // --- Historial global ---
  const historialGlobalRef = ref(db, `dispositivos/${deviceId}/historial_global`);
  onValue(historialGlobalRef, (snapshot) => {
    const data = snapshot.val() || {};
    historialGlobalDiv.innerHTML = "";
    registrosGlobal = Object.entries(data).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

    registrosGlobal.forEach(([ts, valores]) => {
      const fecha = new Date(parseInt(ts)).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "medium" });
      const card = document.createElement("div");
      card.className = "historialCard";
      card.innerHTML = `
        <h4>${fecha}</h4>
        <p>CO: ${valores.CO ?? "—"} ppm</p>
        <p>CO₂: ${valores.CO2 ?? "—"} ppm</p>
        <p>PM10: ${valores.PM10 ?? "—"} µg/m³</p>
        <p>PM2.5: ${valores.PM2_5 ?? "—"} µg/m³</p>
        <p>Humedad: ${valores.humedad ?? "—"}%</p>
        <p>Temperatura: ${valores.temperatura ?? "—"} °C</p>
      `;
      historialGlobalDiv.appendChild(card);
    });

    exportExcelBtn.disabled = registrosLocal.length === 0 && registrosGlobal.length === 0;
  });

  exportExcelBtn.onclick = () => exportToExcelMultiSheet(deviceId, registrosLocal, registrosGlobal);
}

// ================================================
// FUNCIONES AUXILIARES: EXPORTAR HISTORIAL A EXCEL MULTIHOJA
// ================================================
async function exportToExcelMultiSheet(deviceId, registrosLocal, registrosGlobal) {
  // Obtener email del usuario asignado
  let userEmail = "Sin asignar";
  try {
    const snapshot = await get(ref(db, "usuarios"));
    const usuarios = snapshot.val() || {};
    for (let uid in usuarios) {
      if (usuarios[uid].deviceId === deviceId) {
        userEmail = usuarios[uid].email || userEmail;
        break;
      }
    }
  } catch (err) {
    console.error("Error al obtener usuario:", err);
  }

  // Crear arrays de datos para hojas
  const hojaLocal = [["Fecha", "CO", "CO2", "PM10", "PM2.5", "Humedad", "Temperatura", "Usuario", "Dispositivo"]];
  registrosLocal.forEach(([ts, valores]) => {
    hojaLocal.push([
      new Date(parseInt(ts)).toLocaleString("es-CL"),
      valores.CO ?? "",
      valores.CO2 ?? "",
      valores.PM10 ?? "",
      valores.PM2_5 ?? "",
      valores.humedad ?? "",
      valores.temperatura ?? "",
      userEmail,
      deviceId
    ]);
  });

  const hojaGlobal = [["Fecha", "CO", "CO2", "PM10", "PM2.5", "Humedad", "Temperatura", "Usuario", "Dispositivo"]];
  registrosGlobal.forEach(([ts, valores]) => {
    hojaGlobal.push([
      new Date(parseInt(ts)).toLocaleString("es-CL"),
      valores.CO ?? "",
      valores.CO2 ?? "",
      valores.PM10 ?? "",
      valores.PM2_5 ?? "",
      valores.humedad ?? "",
      valores.temperatura ?? "",
      userEmail,
      deviceId
    ]);
  });

  // Crear libro de Excel
  const wb = XLSX.utils.book_new();
  const wsLocal = XLSX.utils.aoa_to_sheet(hojaLocal);
  const wsGlobal = XLSX.utils.aoa_to_sheet(hojaGlobal);
  XLSX.utils.book_append_sheet(wb, wsLocal, "Historial Local");
  XLSX.utils.book_append_sheet(wb, wsGlobal, "Historial Global");

  // Descargar Excel
  XLSX.writeFile(wb, `historial_${deviceId}.xlsx`);
}
