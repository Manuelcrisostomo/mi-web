// ================================================
// IMPORTACIONES Y CONFIGURACIÓN
// ================================================
import {
  auth, db, firestore, ref, onValue, get, remove, onAuthStateChanged
} from "../firebaseConfig.js";

import { doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";
import { showHistoryUtilsPage } from "./historyUtils.js";
import { showNewHistoryPage } from "./Histors.js";
import { showPagina1, showPagina2 } from "./paginas.js";
import { showHistoryManagerPage } from "./historyManager.js";

// ================================================
// NAV / MENÚ PRINCIPAL
// ================================================
export function showNav() {
  const navRoot = document.getElementById("nav");
  navRoot.innerHTML = `
    <nav class="navbar">
      <button onclick="navigate('admin')">🏠 Dashboard Admin</button>
      <button onclick="navigate('user')">👤 Perfil Usuario</button>
      <button onclick="navigate('devices')">📱 Dispositivos</button>
      <button onclick="navigate('alerts')">⚠️ Alertas</button>
      <button onclick="navigate('history')">📜 Historial General</button>
      <button onclick="auth.signOut().then(()=>navigate('login'))">🔓 Cerrar Sesión</button>
    </nav>
  `;
}

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
// DASHBOARD USUARIO
// ================================================
export function showUserDashboard() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card">Cargando datos...</div>

      <form id="editForm" class="card">
        <h3>Datos Personales</h3>
        <label>Nombre:</label><input type="text" id="nombre" placeholder="Nombre completo" />
        <label>Teléfono:</label><input type="text" id="telefono" placeholder="Teléfono" />
        <label>Dirección:</label><input type="text" id="direccion" placeholder="Dirección" />
        <label>ID del Dispositivo:</label><input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" />

        <h3>Tipo de Mina</h3>
        <select id="tipoMina">
          <option value="">Seleccione tipo de mina</option>
          <option value="subterranea">Subterránea</option>
          <option value="tajo_abierto">Tajo Abierto</option>
          <option value="aluvial">Aluvial (placer)</option>
          <option value="cantera">Cantera</option>
          <option value="pirqen">Pirquén / artesanal</option>
        </select>
        <div id="camposMinaDinamicos"></div>

        <h3>Datos Técnicos (Mapas/Sistema)</h3>
        <label>Latitud:</label><input type="number" id="latitude" step="any" placeholder="0" />
        <label>Longitud:</label><input type="number" id="longitude" step="any" placeholder="0" />
        <label>Altitud (m):</label><input type="number" id="altitude" step="any" placeholder="0" />
        <label>Precisión (m):</label><input type="number" id="precision" step="any" placeholder="0" />
        <label>EPSG/WGS84:</label><input type="text" id="EPSG" placeholder="WGS84" />

        <h3>Datos Geográficos / Empresariales</h3>
        <label>País:</label><input type="text" id="pais" placeholder="País" />
        <label>Región:</label><input type="text" id="region" placeholder="Región" />
        <label>Comuna:</label><input type="text" id="comuna" placeholder="Comuna" />
        <label>Nombre de la empresa:</label><input type="text" id="nombreEmpresa" placeholder="Nombre de la empresa" />

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

  // ===== Campos dinámicos según tipo de mina =====
  const tipoMinaSelect = document.getElementById("tipoMina");
  const camposMinaDiv = document.getElementById("camposMinaDinamicos");
  tipoMinaSelect.addEventListener("change", () => {
    const tipo = tipoMinaSelect.value;
    let html = "";
    switch (tipo) {
      case "subterranea":
        html = `<label>Zona:</label><input type="text" id="zona" />
                <label>Rampa:</label><input type="text" id="rampa" />
                <label>Galería:</label><input type="text" id="galeria" />
                <label>Sector:</label><input type="text" id="sector" />
                <label>Nombre de estación:</label><input type="text" id="nombreEstacion" />`;
        break;
      case "tajo_abierto":
        html = `<label>Banco:</label><input type="text" id="banco" />
                <label>Frente:</label><input type="text" id="frente" />
                <label>Zona:</label><input type="text" id="zona" />
                <label>Sector:</label><input type="text" id="sector" />`;
        break;
      case "aluvial":
        html = `<label>Mina:</label><input type="text" id="mina" />
                <label>Río:</label><input type="text" id="rio" />
                <label>Cuadrante:</label><input type="text" id="cuadrante" />`;
        break;
      case "cantera":
        html = `<label>Cantera:</label><input type="text" id="cantera" />
                <label>Material:</label><input type="text" id="material" />
                <label>Frente:</label><input type="text" id="frente" />`;
        break;
      case "pirqen":
        html = `<label>Faena:</label><input type="text" id="faena" />
                <label>Tipo de explotación:</label><input type="text" id="tipoExplotacion" />
                <label>Sector:</label><input type="text" id="sector" />
                <label>Nivel:</label><input type="text" id="nivel" />`;
        break;
    }
    camposMinaDiv.innerHTML = html;
  });

  // ===== Eventos =====
  document.getElementById("logoutBtn").onclick = async () => { await auth.signOut(); navigate("login"); };
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("historyBtn").onclick = () => showHistoryUtilsPage();
  document.getElementById("nuevoBtnUser").onclick = () => showNewHistoryPage();
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();

  // ===== Sincronización de datos =====
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");
    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore, "users", userId);

    onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "No registrado"}</p>
        <p><b>Correo:</b> ${userEmail}</p>
        <p><b>Teléfono:</b> ${data.telefono || "-"}</p>
        <p><b>Dirección:</b> ${data.direccion || "-"}</p>
        <p><b>ID del Dispositivo:</b> ${data.deviceId || "No asignado"}</p>
      `;
      [
        "nombre","telefono","direccion","deviceId","latitude","longitude","altitude",
        "precision","EPSG","pais","region","comuna","nombreEmpresa"
      ].forEach(f => { const el = document.getElementById(f); if(el) el.value = data[f]||"" });
      if (data.deviceId) mostrarDatosDispositivo(data.deviceId);
    });

    // Guardar cambios
    document.getElementById("editForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const newData = {};
      [
        "nombre","telefono","direccion","deviceId","latitude","longitude","altitude",
        "precision","EPSG","pais","region","comuna","nombreEmpresa"
      ].forEach(f => { const el = document.getElementById(f); if(el) newData[f]=el.value.trim() });
      newData.email = userEmail;
      newData.updatedAt = new Date().toISOString();
      try {
        await setDoc(doc(firestore,"users",userId),newData,{merge:true});
        await update(ref(db,`usuarios/${userId}`),newData);
        alert("✅ Datos actualizados correctamente.");
      } catch(err) { console.error(err); alert(`❌ Error al guardar: ${err.message}`);}
    });

    // Borrar usuario
    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Seguro que deseas borrar este usuario?")) return;
      try {
        await deleteDoc(doc(firestore,"users",userId));
        await remove(ref(db,`usuarios/${userId}`));
        alert("🗑️ Usuario eliminado correctamente.");
        navigate("login");
      } catch(err) { console.error(err); alert(`❌ No se pudo borrar el usuario: ${err.message}`);}
    };
  });
}

// ================================================
// FUNCIONES DE DISPOSITIVOS E HISTORIALES
// ================================================
function mostrarDatosDispositivo(deviceId, container=document.getElementById("deviceData")){
  const deviceRef = ref(db,`dispositivos/${deviceId}`);
  onValue(deviceRef,(snapshot)=>{
    const d = snapshot.val();
    if(!d) return container.innerHTML=`<p>No se encontró el dispositivo: <b>${deviceId}</b></p>`;
    container.innerHTML=`
      <p><b>ID:</b> ${deviceId}</p>
      <p><b>Nombre:</b> ${d.name||"Desconocido"}</p>
      <p><b>Usuario:</b> ${d.userEmail||"Sin asignar"}</p>
      <p>CO: ${d.CO??0} ppm</p>
      <p>CO₂: ${d.CO2??0} ppm</p>
      <p>PM10: ${d.PM10??0} µg/m³</p>
      <p>PM2.5: ${d.PM2_5??0} µg/m³</p>
      <p>Humedad: ${d.humedad??0}%</p>
      <p>Temperatura: ${d.temperatura??0} °C</p>
      <h4>📜 Últimos registros históricos</h4>
      <div id="historialCarrusel" class="historialCarrusel">Cargando...</div>
      <button id="verHistorialBtn2">📜 Ver historial completo</button>
    `;
    mostrarHistorialCarrusel(deviceId);
    document.getElementById("verHistorialBtn2").onclick=()=>showHistoricalPage(deviceId);
  });
}

function mostrarHistorialCarrusel(deviceId){
  const historialRef = ref(db,`dispositivos/${deviceId}/historial`);
  onValue(historialRef,(snapshot)=>{
    const historial = snapshot.val();
    const carrusel = document.getElementById("historialCarrusel");
    carrusel.innerHTML="";
    if(!historial) return carrusel.innerHTML="<p>No hay datos históricos.</p>";
    Object.entries(historial)
      .sort((a,b)=>parseInt(b[0])-parseInt(a[0]))
      .slice(0,12)
      .forEach(([ts,datos])=>{
        const card=document.createElement("div");
        card.className="historialCard";
        card.innerHTML=`
          <p><b>${new Date(parseInt(ts)).toLocaleString()}</b></p>
          <p>CO: ${datos.CO??"—"} ppm</p>
          <p>CO₂: ${datos.CO2??"—"} ppm</p>
          <p>PM10: ${datos.PM10??"—"} µg/m³</p>
          <p>PM2.5: ${datos.PM2_5??"—"} µg/m³</p>
          <p>Humedad: ${datos.humedad??"—"}%</p>
          <p>Temperatura: ${datos.temperatura??"—"} °C</p>
        `;
        carrusel.appendChild(card);
      });
  });
}

// ================================================
// TODOS LOS DISPOSITIVOS
// ================================================
export function showAllDevices(){
  const root = document.getElementById("root");
  root.innerHTML=`
    <div class="dashboard">
      <h2>Todos los Dispositivos</h2>
      <div id="deviceList">Cargando dispositivos...</div>
      <button id="backBtn">Volver</button>
    </div>
  `;
  document.getElementById("backBtn").onclick=()=>navigate("user");
  const devicesRef = ref(db,"dispositivos");
  onValue(devicesRef,(snapshot)=>{
    const devices = snapshot.val();
    const listDiv = document.getElementById("deviceList");
    if(!devices) return listDiv.innerHTML="<p>No hay dispositivos en la base de datos.</p>";
    listDiv.innerHTML="<ul>";
    for(const id in devices){
      const name = devices[id].name||`Dispositivo ${id}`;
      listDiv.innerHTML+=`<li>${name} (ID: ${id}) 
        <button onclick="showHistoricalPage('${id}')">📜 Ver historial</button>
      </li>`;
    }
    listDiv.innerHTML+="</ul>";
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
