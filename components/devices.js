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

  window.editUser = async (uid) => {
    const userDocRef = doc(firestore, "users", uid);
    const snap = await get(userDocRef);
    if (!snap.exists()) return alert("Usuario no encontrado");
    const data = snap.data();

    const nombre = prompt("Nombre:", data.nombre || "");
    const telefono = prompt("Teléfono:", data.telefono || "");
    const direccion = prompt("Dirección:", data.direccion || "");
    const isAdmin = confirm("¿Es Administrador? (OK = Sí, Cancel = No)");

    await setDoc(userDocRef, { ...data, nombre, telefono, direccion, isAdmin }, { merge: true });
    await update(ref(db, `usuarios/${uid}`), { nombre, telefono, direccion, isAdmin });
    alert("Usuario actualizado ✅");
  };

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
// DASHBOARD USUARIO / ADMINISTRADOR
// ================================================
export function showUserDashboard() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card">Cargando datos...</div>

      <h3>Editar Datos y Ubicación del Dispositivo</h3>
      <form id="editForm" class="card">
        <label>Nombre:</label>
        <input type="text" id="nombre" placeholder="Nombre completo" />
        <label>Teléfono:</label>
        <input type="text" id="telefono" placeholder="Teléfono" />
        <label>Dirección:</label>
        <input type="text" id="direccion" placeholder="Dirección" />
        <label>ID del Dispositivo:</label>
        <input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" />
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

  // Botones de navegación
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("historyBtn").onclick = () => showHistoryUtilsPage();
  document.getElementById("nuevoBtnUser").onclick = () => showNewHistoryPage();
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();
  document.getElementById("logoutBtn").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  onAuthStateChanged(auth, async (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");
    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore, "users", userId);

    onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};

      // Mostrar datos del perfil
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "No registrado"}</p>
        <p><b>Correo:</b> ${userEmail}</p>
        <p><b>Teléfono:</b> ${data.telefono || "-"}</p>
        <p><b>Dirección:</b> ${data.direccion || "-"}</p>
        <p><b>ID del Dispositivo:</b> ${data.deviceId || "No asignado"}</p>
      `;

      // Llenar formulario usuario
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("telefono").value = data.telefono || "";
      document.getElementById("direccion").value = data.direccion || "";
      document.getElementById("deviceId").value = data.deviceId || "";

      // Mostrar dispositivo editable si existe
      if (data.deviceId) mostrarDatosDispositivo(data.deviceId, data);
    });

    // Editar datos del usuario
    document.getElementById("editForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombre").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const direccion = document.getElementById("direccion").value.trim();
      const deviceId = document.getElementById("deviceId").value.trim();

      if (!deviceId) return alert("Debe asignar un ID de dispositivo válido");

      const newUserData = { nombre, telefono, direccion, deviceId, email: userEmail, updatedAt: new Date().toISOString() };

      try {
        await setDoc(doc(firestore, "users", userId), newUserData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), newUserData);
        alert("✅ Datos de usuario actualizados correctamente.");

        if (deviceId) mostrarDatosDispositivo(deviceId);
      } catch (error) {
        console.error(error);
        alert(`❌ Error al guardar: ${error.message}`);
      }
    });

    // Borrar usuario
    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Seguro que deseas borrar este usuario?")) return;
      try {
        await deleteDoc(doc(firestore, "users", userId));
        await remove(ref(db, `usuarios/${userId}`));
        alert("🗑️ Usuario eliminado correctamente.");
        navigate("login");
      } catch (error) {
        console.error(error);
        alert(`❌ No se pudo borrar el usuario: ${error.message}`);
      }
    };

    // Función para mostrar y editar dispositivo
    function mostrarDatosDispositivo(deviceId, userData = {}) {
      const container = document.getElementById("deviceData");
      const deviceRef = ref(db, `dispositivos/${deviceId}`);
      onValue(deviceRef, (snapshot) => {
        const d = snapshot.val();
        if (!d) return container.innerHTML = `<p>No se encontró el dispositivo <b>${deviceId}</b></p>`;

        container.innerHTML = `
          <h4>Dispositivo: ${deviceId}</h4>
          <label>Latitud:</label>
          <input type="text" id="editLatitude" value="${d.latitude ?? userData.latitude ?? ""}" />
          <label>Longitud:</label>
          <input type="text" id="editLongitude" value="${d.longitude ?? userData.longitude ?? ""}" />
          <label>Altitud (m):</label>
          <input type="text" id="editAltitude" value="${d.altitude ?? userData.altitude ?? ""}" />
          <label>Zona:</label>
          <input type="text" id="editSiteZone" value="${d.siteZone ?? userData.siteZone ?? ""}" />
          <label>Punto de Instalación:</label>
          <input type="text" id="editInstallationPoint" value="${d.installationPoint ?? userData.installationPoint ?? ""}" />
          <button id="saveDeviceBtn">💾 Guardar Ubicación</button>
        `;

        document.getElementById("saveDeviceBtn").onclick = async () => {
          const latitude = parseFloat(document.getElementById("editLatitude").value) || 0;
          const longitude = parseFloat(document.getElementById("editLongitude").value) || 0;
          const altitude = parseFloat(document.getElementById("editAltitude").value) || 0;
          const siteZone = document.getElementById("editSiteZone").value.trim();
          const installationPoint = document.getElementById("editInstallationPoint").value.trim();

          try {
            await update(deviceRef, { latitude, longitude, altitude, siteZone, installationPoint, userEmail });
            alert("✅ Ubicación del dispositivo actualizada correctamente.");
          } catch (error) {
            console.error(error);
            alert(`❌ Error al actualizar dispositivo: ${error.message}`);
          }
        };
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
