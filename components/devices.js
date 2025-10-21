// ================================================
// device.js - Gestión de Usuarios, Dispositivos y Historial
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
// PANEL ADMINISTRADOR
// ================================================
export function showAdminDashboard() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Panel del Administrador</h2>
      <div id="users"></div>
      <div id="editUserFormContainer"></div>
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
    const data = snapshot.val() || {};
    const container = document.getElementById("users");
    container.innerHTML = "<h3>Usuarios Registrados:</h3>";
    for (let id in data) {
      const user = data[id];
      container.innerHTML += `
        <p>👤 ${user.nombre || "Sin nombre"} (${user.email})
          <button onclick="editUser('${id}')">✏️ Editar</button>
          <button onclick="deleteUser('${id}')">🗑️ Borrar</button>
        </p>
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

  // ================================================
  // EDITAR USUARIO (Formulario Visual)
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
        <label>Nombre:</label>
        <input type="text" id="adminNombre" value="${data.nombre || ""}" />
        <label>Teléfono:</label>
        <input type="text" id="adminTelefono" value="${data.telefono || ""}" />
        <label>Dirección:</label>
        <input type="text" id="adminDireccion" value="${data.direccion || ""}" />
        <label>Rol:</label>
        <select id="adminRol">
          <option value="false" ${!data.isAdmin ? "selected" : ""}>Usuario</option>
          <option value="true" ${data.isAdmin ? "selected" : ""}>Administrador</option>
        </select>
        <h4>Datos de Ubicación del Dispositivo</h4>
        <label>Latitud:</label>
        <input type="number" step="0.000001" id="adminLat" value="${data.latitude ?? 0}" />
        <label>Longitud:</label>
        <input type="number" step="0.000001" id="adminLng" value="${data.longitude ?? 0}" />
        <label>Altitud (m):</label>
        <input type="number" step="0.1" id="adminAlt" value="${data.altitude ?? 0}" />
        <label>Zona:</label>
        <input type="text" id="adminZone" value="${data.siteZone ?? ""}" />
        <label>Punto de Instalación:</label>
        <input type="text" id="adminPoint" value="${data.installationPoint ?? ""}" />
        <button type="submit">💾 Guardar Cambios</button>
        <button type="button" id="cancelEdit">Cancelar</button>
      </form>
    `;

    document.getElementById("cancelEdit").onclick = () => { container.innerHTML = ""; };

    document.getElementById("adminEditForm").onsubmit = async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("adminNombre").value.trim();
      const telefono = document.getElementById("adminTelefono").value.trim();
      const direccion = document.getElementById("adminDireccion").value.trim();
      const isAdmin = document.getElementById("adminRol").value === "true";
      const latitude = parseFloat(document.getElementById("adminLat").value) || 0;
      const longitude = parseFloat(document.getElementById("adminLng").value) || 0;
      const altitude = parseFloat(document.getElementById("adminAlt").value) || 0;
      const siteZone = document.getElementById("adminZone").value.trim();
      const installationPoint = document.getElementById("adminPoint").value.trim();

      const updatedData = { ...data, nombre, telefono, direccion, isAdmin, latitude, longitude, altitude, siteZone, installationPoint };

      try {
        await setDoc(userDocRef, updatedData, { merge: true });
        await update(ref(db, `usuarios/${uid}`), updatedData);
        alert("Usuario y ubicación actualizados ✅");
        container.innerHTML = "";
      } catch (err) {
        console.error(err);
        alert("❌ Error al actualizar el usuario: " + err.message);
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

      <h3>Editar Datos y Ubicación del Dispositivo</h3>
      <form id="editForm" class="card">
        <label>Nombre:</label><input type="text" id="nombre" placeholder="Nombre completo"/>
        <label>Teléfono:</label><input type="text" id="telefono" placeholder="Teléfono"/>
        <label>Dirección:</label><input type="text" id="direccion" placeholder="Dirección"/>
        <label>ID del Dispositivo:</label><input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84"/>
        <label>Latitud:</label><input type="text" id="editLatitude" placeholder="Latitud"/>
        <label>Longitud:</label><input type="text" id="editLongitude" placeholder="Longitud"/>
        <label>Altitud (m):</label><input type="text" id="editAltitude" placeholder="Altitud"/>
        <label>Zona:</label><input type="text" id="editSiteZone" placeholder="Zona minera"/>
        <label>Punto de Instalación:</label><input type="text" id="editInstallationPoint" placeholder="Punto de instalación"/>
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
  // Funciones y eventos
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
      // Formulario
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("telefono").value = data.telefono || "";
      document.getElementById("direccion").value = data.direccion || "";
      document.getElementById("deviceId").value = data.deviceId || "";
      document.getElementById("editLatitude").value = data.latitude ?? "";
      document.getElementById("editLongitude").value = data.longitude ?? "";
      document.getElementById("editAltitude").value = data.altitude ?? "";
      document.getElementById("editSiteZone").value = data.siteZone ?? "";
      document.getElementById("editInstallationPoint").value = data.installationPoint ?? "";

      if (data.deviceId) mostrarDatosDispositivo(data.deviceId, data);
    });

    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombre").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const direccion = document.getElementById("direccion").value.trim();
      const deviceId = document.getElementById("deviceId").value.trim();
      const latitude = parseFloat(document.getElementById("editLatitude").value) || 0;
      const longitude = parseFloat(document.getElementById("editLongitude").value) || 0;
      const altitude = parseFloat(document.getElementById("editAltitude").value) || 0;
      const siteZone = document.getElementById("editSiteZone").value.trim();
      const installationPoint = document.getElementById("editInstallationPoint").value.trim();

      if (!deviceId) return alert("Debe asignar un ID de dispositivo");

      const updatedData = { nombre, telefono, direccion, deviceId, email: userEmail, updatedAt: new Date().toISOString(), latitude, longitude, altitude, siteZone, installationPoint };

      try {
        await setDoc(doc(firestore, "users", userId), updatedData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), updatedData);
        if (deviceId) await update(ref(db, `dispositivos/${deviceId}`), { latitude, longitude, altitude, siteZone, installationPoint, userEmail });
        alert("✅ Datos actualizados correctamente");
        if (deviceId) mostrarDatosDispositivo(deviceId);
      } catch (err) { console.error(err); alert(err.message); }
    };

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
          <p>Altitud (m): ${d.altitude ?? userData.altitude ?? ""}</p>
          <p>Zona: ${d.siteZone ?? userData.siteZone ?? ""}</p>
          <p>Punto Instalación: ${d.installationPoint ?? userData.installationPoint ?? ""}</p>
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
    if (!devices) return listDiv.innerHTML = "<p>No hay dispositivos</p>";
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
