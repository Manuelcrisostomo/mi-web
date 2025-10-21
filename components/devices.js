// ================================================
// device.js - Gestión de Usuarios, Dispositivos y Historial (con diseño)
// ================================================

// ================================================
// Firebase y Navegación
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
// Estilos de diseño moderno integrados
// ================================================
const style = document.createElement("style");
style.innerHTML = `
  body {
    font-family: 'Segoe UI', sans-serif;
    background: #f4f6f8;
    color: #222;
    margin: 0;
  }
  .dashboard {
    max-width: 1000px;
    margin: 40px auto;
    background: #fff;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  }
  h2, h3, h4 {
    color: #005f73;
    margin-bottom: 10px;
  }
  .card {
    background: #f9fafb;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: inset 0 0 5px rgba(0,0,0,0.05);
  }
  label {
    display: block;
    font-weight: bold;
    margin-top: 10px;
  }
  input, select {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 14px;
  }
  button {
    background: #0a9396;
    color: white;
    border: none;
    padding: 10px 16px;
    margin: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  button:hover {
    background: #007f89;
  }
  .delete-btn {
    background: #ae2012;
  }
  .delete-btn:hover {
    background: #9b1c10;
  }
  .actions {
    text-align: center;
    margin-top: 20px;
  }
  .historialGrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
    margin-top: 20px;
  }
  .historialCard {
    background: #f1f5f9;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.05);
    font-size: 13px;
  }
  .historialCard h4 {
    margin: 0 0 8px;
    color: #005f73;
  }
  ul {
    list-style: none;
    padding-left: 0;
  }
  li {
    background: #eef3f7;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 8px;
  }
  li button {
    float: right;
    font-size: 12px;
    padding: 5px 10px;
  }
`;
document.head.appendChild(style);

// ================================================
// PANEL ADMINISTRADOR
// ================================================
export function showAdminDashboard() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Panel del Administrador</h2>
      <div id="users" class="card"></div>
      <div id="editUserFormContainer"></div>
      <div class="actions">
        <button id="historyBtn">📜 Historial General</button>
        <button id="nuevoBtnAdmin">✨ Nuevo Registro</button>
        <button id="pagina1Btn">📄 Página 1</button>
        <button id="pagina2Btn">📄 Página 2</button>
        <button id="logout">Cerrar Sesión</button>
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
      container.innerHTML += `
        <div class="card">
          <p><b>👤 ${user.nombre || "Sin nombre"}</b> (${user.email})</p>
          <button onclick="editUser('${id}')">✏️ Editar</button>
          <button class="delete-btn" onclick="deleteUser('${id}')">🗑️ Borrar</button>
        </div>
      `;
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

  // ---- Funciones editar y eliminar (mismo código anterior) ----
  // (Se mantiene tu lógica completa actualizada con los nuevos campos)
  // Aquí continúa exactamente el bloque que ya tienes implementado:
  // window.editUser = async (uid) => { ... }
  // window.deleteUser = async (uid) => { ... }
}

// ================================================
// DASHBOARD USUARIO (mantiene tu funcionalidad)
// ================================================
export function showUserDashboard() {
  // (Todo el código de tu función existente)
  // Solo cambia el diseño visual gracias al bloque CSS superior.
  // Copia íntegro el código que ya tienes de showUserDashboard()
}

// ================================================
// HISTORIAL Y DISPOSITIVOS
// ================================================
// (Todo tu bloque showAllDevices, showHistoricalPage, exportToExcelMultiSheet se mantiene igual)

  // ================================================
  // EDITAR USUARIO Y UBICACIÓN DEL DISPOSITIVO
  // ================================================
  window.editUser = async (uid) => {
    const userDocRef = doc(firestore, "users", uid);
    const snap = await get(userDocRef);
    if (!snap.exists()) return alert("Usuario no encontrado");
    const data = snap.data();

    const container = document.getElementById("editUserFormContainer");
    container.innerHTML = `
      <h3>Editar Datos del Usuario</h3>
      <form id="adminEditForm" class="card">
        <h4>Datos Personales</h4>
        <label>Nombre:</label><input type="text" id="adminNombre" value="${data.nombre || ""}" />
        <label>Teléfono:</label><input type="text" id="adminTelefono" value="${data.telefono || ""}" />
        <label>Dirección:</label><input type="text" id="adminDireccion" value="${data.direccion || ""}" />
        <label>Rol:</label>
        <select id="adminRol">
          <option value="false" ${!data.isAdmin ? "selected" : ""}>Usuario</option>
          <option value="true" ${data.isAdmin ? "selected" : ""}>Administrador</option>
        </select>

        <h4>Datos Humanos (Operador)</h4>
        <label>Zona:</label><input type="text" id="humanZona" value="${data.zona || ""}" />
        <label>Rampa:</label><input type="text" id="humanRampa" value="${data.rampa || ""}" />
        <label>Galería:</label><input type="text" id="humanGaleria" value="${data.galeria || ""}" />
        <label>Sector:</label><input type="text" id="humanSector" value="${data.sector || ""}" />
        <label>Nombre de estación:</label><input type="text" id="humanEstacion" value="${data.nombreEstacion || ""}" />

        <h4>Datos Técnicos (Sistema/Mapa)</h4>
        <label>Latitud:</label><input type="number" step="0.000001" id="techLat" value="${data.latitude ?? data.latitud ?? 0}" />
        <label>Longitud:</label><input type="number" step="0.000001" id="techLng" value="${data.longitude ?? data.longitud ?? 0}" />
        <label>Altitud (m):</label><input type="number" step="0.1" id="techAlt" value="${data.altitude ?? data.altitud ?? 0}" />
        <label>Precisión (m):</label><input type="number" step="0.01" id="techPrecision" value="${data.precision ?? data.precision_m ?? 0}" />
        <label>EPSG/WGS84:</label><input type="text" id="techEPSG" value="${data.EPSG ?? "WGS84"}" />

        <h4>Datos Geográficos / Empresariales</h4>
        <label>País:</label><input type="text" id="geoPais" value="${data.pais || ""}" />
        <label>Región:</label><input type="text" id="geoRegion" value="${data.region || ""}" />
        <label>Comuna:</label><input type="text" id="geoComuna" value="${data.comuna || ""}" />
        <label>Nombre de mina:</label><input type="text" id="geoMina" value="${data.nombreMina || ""}" />
        <label>Nombre de empresa:</label><input type="text" id="geoEmpresa" value="${data.nombreEmpresa || ""}" />

        <label>ID del Dispositivo:</label><input type="text" id="deviceId" value="${data.deviceId || ""}" />

        <button type="submit">💾 Guardar Cambios</button>
        <button type="button" id="cancelEdit">Cancelar</button>
      </form>
    `;

    document.getElementById("cancelEdit").onclick = () => { container.innerHTML = ""; };

    // Guardar cambios
    document.getElementById("adminEditForm").onsubmit = async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("adminNombre").value.trim();
      const telefono = document.getElementById("adminTelefono").value.trim();
      const direccion = document.getElementById("adminDireccion").value.trim();
      const isAdmin = document.getElementById("adminRol").value === "true";

      const zona = document.getElementById("humanZona").value.trim();
      const rampa = document.getElementById("humanRampa").value.trim();
      const galeria = document.getElementById("humanGaleria").value.trim();
      const sector = document.getElementById("humanSector").value.trim();
      const nombreEstacion = document.getElementById("humanEstacion").value.trim();

      const latitude = parseFloat(document.getElementById("techLat").value) || 0;
      const longitude = parseFloat(document.getElementById("techLng").value) || 0;
      const altitude = parseFloat(document.getElementById("techAlt").value) || 0;
      const precision = parseFloat(document.getElementById("techPrecision").value) || 0;
      const EPSG = document.getElementById("techEPSG").value.trim();

      const pais = document.getElementById("geoPais").value.trim();
      const region = document.getElementById("geoRegion").value.trim();
      const comuna = document.getElementById("geoComuna").value.trim();
      const nombreMina = document.getElementById("geoMina").value.trim();
      const nombreEmpresa = document.getElementById("geoEmpresa").value.trim();

      const deviceId = document.getElementById("deviceId").value.trim();

      const updatedUserData = {
        ...data, nombre, telefono, direccion, isAdmin,
        zona, rampa, galeria, sector, nombreEstacion,
        latitude, longitude, altitude, precision, EPSG,
        pais, region, comuna, nombreMina, nombreEmpresa,
        deviceId
      };

      try {
        await setDoc(doc(firestore, "users", uid), updatedUserData, { merge: true });
        await update(ref(db, `usuarios/${uid}`), updatedUserData);
        if (deviceId) await update(ref(db, `dispositivos/${deviceId}`), updatedUserData);
        alert("Usuario y ubicación actualizados ✅");
        container.innerHTML = "";
      } catch (err) {
        console.error(err);
        alert("❌ Error al actualizar: " + err.message);
      }
    };
  };

  // ================================================
  // ELIMINAR USUARIO
  // ================================================
  window.deleteUser = async (uid) => {
    if (!confirm("¿Desea eliminar este usuario?")) return;
    try {
      await deleteDoc(doc(firestore, "users", uid));
      await remove(ref(db, `usuarios/${uid}`));
      alert("Usuario eliminado correctamente 🗑️");
    } catch (err) {
      console.error(err);
      alert("Error al eliminar usuario ❌");
    }
  };


// ... código previo de imports y panel admin intacto ...

// ---------------------------------
// DASHBOARD USUARIO
// ---------------------------------
export function showUserDashboard() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card">Cargando datos...</div>

      <h3>Editar Datos y Ubicación del Dispositivo</h3>
      <form id="editForm" class="card">
        <h4>Datos Personales</h4>
        <label>Nombre:</label><input type="text" id="nombre"/>
        <label>Teléfono:</label><input type="text" id="telefono"/>
        <label>Dirección:</label><input type="text" id="direccion"/>

        <h4>Datos Humanos (Operador)</h4>
        <label>Zona:</label><input type="text" id="humanZona"/>
        <label>Rampa:</label><input type="text" id="humanRampa"/>
        <label>Galería:</label><input type="text" id="humanGaleria"/>
        <label>Sector:</label><input type="text" id="humanSector"/>
        <label>Nombre de estación:</label><input type="text" id="humanEstacion"/>

        <h4>Datos Técnicos (Sistema/Mapa)</h4>
        <label>Latitud:</label><input type="number" step="0.000001" id="editLatitude"/>
        <label>Longitud:</label><input type="number" step="0.000001" id="editLongitude"/>
        <label>Altitud (m):</label><input type="number" step="0.1" id="editAltitude"/>
        <label>Precisión (m):</label><input type="number" step="0.01" id="editPrecision"/>
        <label>EPSG/WGS84:</label><input type="text" id="editEPSG"/>

        <h4>Datos Geográficos / Empresariales</h4>
        <label>País:</label><input type="text" id="geoPais"/>
        <label>Región:</label><input type="text" id="geoRegion"/>
        <label>Comuna:</label><input type="text" id="geoComuna"/>
        <label>Nombre de mina:</label><input type="text" id="geoMina"/>
        <label>Nombre de empresa:</label><input type="text" id="geoEmpresa"/>

        <label>ID del Dispositivo:</label><input type="text" id="deviceId"/>
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

  // -----------------------------
  // Eventos y funciones
  // -----------------------------
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => showAllDevices();
  document.getElementById("historyBtn").onclick = () => showHistoricalPageForUser();
  document.getElementById("nuevoBtnUser").onclick = () => showHistoryManagerPage();
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();
  document.getElementById("logoutBtn").onclick = async () => { await auth.signOut(); navigate("login"); };

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore, "users", userId);

    onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      // Perfil
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Email:</b> ${userEmail}</p>
        <p><b>Tel:</b> ${data.telefono || "-"}</p>
        <p><b>Dispositivo:</b> ${data.deviceId || "No asignado"}</p>
      `;

      // Llenar formulario con todos los campos nuevos
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("telefono").value = data.telefono || "";
      document.getElementById("direccion").value = data.direccion || "";

      document.getElementById("humanZona").value = data.zona || "";
      document.getElementById("humanRampa").value = data.rampa || "";
      document.getElementById("humanGaleria").value = data.galeria || "";
      document.getElementById("humanSector").value = data.sector || "";
      document.getElementById("humanEstacion").value = data.nombreEstacion || "";

      document.getElementById("editLatitude").value = data.latitude ?? data.latitud ?? "";
      document.getElementById("editLongitude").value = data.longitude ?? data.longitud ?? "";
      document.getElementById("editAltitude").value = data.altitude ?? data.altitud ?? "";
      document.getElementById("editPrecision").value = data.precision ?? data.precision_m ?? "";
      document.getElementById("editEPSG").value = data.EPSG ?? "WGS84";

      document.getElementById("geoPais").value = data.pais || "";
      document.getElementById("geoRegion").value = data.region || "";
      document.getElementById("geoComuna").value = data.comuna || "";
      document.getElementById("geoMina").value = data.nombreMina || "";
      document.getElementById("geoEmpresa").value = data.nombreEmpresa || "";

      document.getElementById("deviceId").value = data.deviceId || "";

      if (data.deviceId) mostrarDatosDispositivo(data.deviceId, data);
    });

    // Guardar cambios incluyendo nuevos campos
    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();

      const updatedData = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        deviceId: document.getElementById("deviceId").value.trim(),
        email: userEmail,
        zona: document.getElementById("humanZona").value.trim(),
        rampa: document.getElementById("humanRampa").value.trim(),
        galeria: document.getElementById("humanGaleria").value.trim(),
        sector: document.getElementById("humanSector").value.trim(),
        nombreEstacion: document.getElementById("humanEstacion").value.trim(),
        latitude: parseFloat(document.getElementById("editLatitude").value) || 0,
        longitude: parseFloat(document.getElementById("editLongitude").value) || 0,
        altitude: parseFloat(document.getElementById("editAltitude").value) || 0,
        precision: parseFloat(document.getElementById("editPrecision").value) || 0,
        EPSG: document.getElementById("editEPSG").value.trim(),
        pais: document.getElementById("geoPais").value.trim(),
        region: document.getElementById("geoRegion").value.trim(),
        comuna: document.getElementById("geoComuna").value.trim(),
        nombreMina: document.getElementById("geoMina").value.trim(),
        nombreEmpresa: document.getElementById("geoEmpresa").value.trim(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(firestore, "users", userId), updatedData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), updatedData);
        if (updatedData.deviceId) await update(ref(db, `dispositivos/${updatedData.deviceId}`), updatedData);
        alert("✅ Datos actualizados correctamente");
        if (updatedData.deviceId) mostrarDatosDispositivo(updatedData.deviceId);
      } catch (err) {
        console.error(err);
        alert("❌ Error al actualizar: " + err.message);
      }
    };

    // Borrar usuario
    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Desea borrar el usuario?")) return;
      try {
        await deleteDoc(doc(firestore, "users", userId));
        await remove(ref(db, `usuarios/${userId}`));
        alert("Usuario eliminado");
        navigate("login");
      } catch (err) { console.error(err); alert(err.message); }
    };

    function mostrarDatosDispositivo(deviceId, userData = {}) {
      const container = document.getElementById("deviceData");
      const deviceRef = ref(db, `dispositivos/${deviceId}`);
      onValue(deviceRef, (snapshot) => {
        const d = snapshot.val();
        if (!d) return container.innerHTML = `<p>No se encontró el dispositivo ${deviceId}</p>`;
        container.innerHTML = `
          <h4>Dispositivo: ${deviceId}</h4>
          <p>Latitud: ${d.latitude ?? userData.latitude ?? ""}</p>
          <p>Longitud: ${d.longitude ?? userData.longitude ?? ""}</p>
          <p>Altitud: ${d.altitude ?? userData.altitude ?? ""}</p>
          <p>Precisión: ${d.precision ?? userData.precision ?? ""}</p>
          <p>EPSG/WGS84: ${d.EPSG ?? userData.EPSG ?? "WGS84"}</p>
          <p>Zona: ${d.zona ?? userData.zona ?? ""}</p>
          <p>Rampa: ${d.rampa ?? userData.rampa ?? ""}</p>
          <p>Galería: ${d.galeria ?? userData.galeria ?? ""}</p>
          <p>Sector: ${d.sector ?? userData.sector ?? ""}</p>
          <p>Nombre de estación: ${d.nombreEstacion ?? userData.nombreEstacion ?? ""}</p>
          <p>País: ${d.pais ?? userData.pais ?? ""}</p>
          <p>Región: ${d.region ?? userData.region ?? ""}</p>
          <p>Comuna: ${d.comuna ?? userData.comuna ?? ""}</p>
          <p>Nombre de mina: ${d.nombreMina ?? userData.nombreMina ?? ""}</p>
          <p>Nombre de empresa: ${d.nombreEmpresa ?? userData.nombreEmpresa ?? ""}</p>
        `;
      });
    }
  });
}

// ================================================
// MOSTRAR TODOS LOS DISPOSITIVOS
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
  document.getElementById("backBtn").onclick = () => showUserDashboard();

  const devicesRef = ref(db, "dispositivos");
  onValue(devicesRef, (snapshot) => {
    const devices = snapshot.val() || {};
    const listDiv = document.getElementById("deviceList");
    listDiv.innerHTML = "<ul>";
    for (const id in devices) {
      const name = devices[id].name || `Dispositivo ${id}`;
      listDiv.innerHTML += `
        <li>${name} (ID: ${id})
          <button onclick="showHistoricalPage('${id}')">📜 Ver historial</button>
        </li>
      `;
    }
    listDiv.innerHTML += "</ul>";
  });
}

// ================================================
// HISTORIAL COMPLETO Y EXPORTACIÓN EXCEL MULTIHOJA
// ================================================
export function showHistoricalPage(deviceId) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Historial del Dispositivo</h2>
      <p><b>ID:</b> ${deviceId}</p>
      <div class="actions">
        <button id="exportExcelBtn" disabled>💾 Exportar a Excel</button>
        <button id="backBtn">Volver</button>
      </div>
      <h3>Historial del dispositivo</h3>
      <div id="historialContainer" class="historialGrid">Cargando...</div>
      <h3>Historial global</h3>
      <div id="historialGlobalContainer" class="historialGrid">Cargando...</div>
    </div>
  `;

  const historialDiv = document.getElementById("historialContainer");
  const historialGlobalDiv = document.getElementById("historialGlobalContainer");
  const exportExcelBtn = document.getElementById("exportExcelBtn");

  document.getElementById("backBtn").onclick = () => showAllDevices();

  let registrosLocal = [];
  let registrosGlobal = [];

  const historialRef = ref(db, `dispositivos/${deviceId}/historial`);
  onValue(historialRef, (snap) => {
    const data = snap.val() || {};
    historialDiv.innerHTML = "";
    registrosLocal = Object.entries(data).sort((a,b)=>parseInt(b[0])-parseInt(a[0]));
    registrosLocal.forEach(([ts,val]) => {
      const fecha = new Date(parseInt(ts)).toLocaleString("es-CL",{dateStyle:"short",timeStyle:"medium"});
      const card = document.createElement("div"); card.className="historialCard";
      card.innerHTML = `<h4>${fecha}</h4>
        <p>CO: ${val.CO ?? "—"} ppm</p>
        <p>CO₂: ${val.CO2 ?? "—"} ppm</p>
        <p>PM10: ${val.PM10 ?? "—"} µg/m³</p>
        <p>PM2.5: ${val.PM2_5 ?? "—"} µg/m³</p>
        <p>Humedad: ${val.humedad ?? "—"}%</p>
        <p>Temperatura: ${val.temperatura ?? "—"} °C</p>`;
      historialDiv.appendChild(card);
    });
    exportExcelBtn.disabled = registrosLocal.length===0 && registrosGlobal.length===0;
  });

  const historialGlobalRef = ref(db, `dispositivos/${deviceId}/historial_global`);
  onValue(historialGlobalRef, (snap) => {
    const data = snap.val() || {};
    historialGlobalDiv.innerHTML = "";
    registrosGlobal = Object.entries(data).sort((a,b)=>parseInt(b[0])-parseInt(a[0]));
    registrosGlobal.forEach(([ts,val])=>{
      const fecha = new Date(parseInt(ts)).toLocaleString("es-CL",{dateStyle:"short",timeStyle:"medium"});
      const card = document.createElement("div"); card.className="historialCard";
      card.innerHTML = `<h4>${fecha}</h4>
        <p>CO: ${val.CO ?? "—"} ppm</p>
        <p>CO₂: ${val.CO2 ?? "—"} ppm</p>
        <p>PM10: ${val.PM10 ?? "—"} µg/m³</p>
        <p>PM2.5: ${val.PM2_5 ?? "—"} µg/m³</p>
        <p>Humedad: ${val.humedad ?? "—"}%</p>
        <p>Temperatura: ${val.temperatura ?? "—"} °C</p>`;
      historialGlobalDiv.appendChild(card);
    });
    exportExcelBtn.disabled = registrosLocal.length===0 && registrosGlobal.length===0;
  });

  exportExcelBtn.onclick = () => exportToExcelMultiSheet(deviceId, registrosLocal, registrosGlobal);
}

// ================================================
// FUNCIONES AUXILIARES
// ================================================
async function exportToExcelMultiSheet(deviceId, registrosLocal, registrosGlobal){
  let userEmail = "Sin asignar";
  try{
    const snap = await get(ref(db,"usuarios"));
    const usuarios = snap.val()||{};
    for(let uid in usuarios){
      if(usuarios[uid].deviceId===deviceId){userEmail=usuarios[uid].email||userEmail; break;}
    }
  }catch(e){console.error(e);}
  const hojaLocal=[["Fecha","CO","CO2","PM10","PM2.5","Humedad","Temperatura","Usuario","Dispositivo"]];
  registrosLocal.forEach(([ts,val])=>hojaLocal.push([
    new Date(parseInt(ts)).toLocaleString("es-CL"),
    val.CO ?? "", val.CO2 ?? "", val.PM10 ?? "", val.PM2_5 ?? "",
    val.humedad ?? "", val.temperatura ?? "", userEmail, deviceId
  ]));
  const hojaGlobal=[["Fecha","CO","CO2","PM10","PM2.5","Humedad","Temperatura","Usuario","Dispositivo"]];
  registrosGlobal.forEach(([ts,val])=>hojaGlobal.push([
    new Date(parseInt(ts)).toLocaleString("es-CL"),
    val.CO ?? "", val.CO2 ?? "", val.PM10 ?? "", val.PM2_5 ?? "",
    val.humedad ?? "", val.temperatura ?? "", userEmail, deviceId
  ]));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hojaLocal),"Historial Local");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hojaGlobal),"Historial Global");
  XLSX.writeFile(wb, `historial_${deviceId}.xlsx`);
}
