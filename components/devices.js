// ================================================
// Firebase y Navegación
// ================================================
import {
  auth, db, firestore, ref, onValue, get, remove, onAuthStateChanged
} from "../firebaseConfig.js";

import { doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";
import { showHistoryUtilsPage } from "./historyUtils.js"; // Historial general
import { showNewHistoryPage } from "./Histors.js"; // Nuevo botón
import { showPagina1, showPagina2 } from "./paginas.js"; // Páginas adicionales
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

      <!-- BOTONES ADMIN -->
      <div class="actions">
        <button id="historyBtn">📜 Historial General</button>
        <button id="nuevoBtnAdmin">✨ Nuevo Botón</button>
        <button id="pagina1Btn">📄 Página 1</button> <!-- Botón Página 1 -->
        <button id="pagina2Btn">📄 Página 2</button> <!-- Botón Página 2 -->
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
      container.innerHTML += `<p>👤 ${user.nombre || "Sin nombre"} (${user.email})</p>`;
    }
  });

  document.getElementById("logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };
  document.getElementById("historyBtn").onclick = () => showHistoryUtilsPage();
  document.getElementById("nuevoBtnAdmin").onclick = () => showNewHistoryPage();

  // ================================================
  // BOTONES NUEVAS PAGINAS
  
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();
  // ================================================
  // Dentro de showDevices(), donde defines los botones:
  document.getElementById("manualPageBtn").onclick = () =>
    showHistoryManagerPage();
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

      <h3>Editar Datos</h3>
      <form id="editForm" class="card">
        <label>Nombre:</label>
        <input type="text" id="nombre" placeholder="Nombre completo" />
        <label>Teléfono:</label>
        <input type="text" id="telefono" placeholder="Teléfono" />
        <label>Dirección:</label>
        <input type="text" id="direccion" placeholder="Dirección" />
        <label>ID del Dispositivo:</label>
        <input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" />
        <label>Rol:</label>
        <select id="isAdmin">
          <option value="false">Usuario Normal</option>
          <option value="true">Administrador</option>
        </select>
        <button type="submit">💾 Guardar Cambios</button>
        <button type="button" id="deleteUser" class="delete-btn">🗑️ Borrar Usuario</button>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card">Cargando dispositivo...</div>

      <!-- BOTONES USUARIO -->
      <div class="actions">
        <button id="alertsBtn">Ver Alertas</button>
        <button id="devicesBtn">Ver Dispositivos</button>
        <button id="historyBtn">📜 Ver Historial</button>
        <button id="nuevoBtnUser">✨ Nuevo Botón</button>
        <button id="pagina1Btn">📄 Página 1</button> <!-- Botón Página 1 -->
        <button id="pagina2Btn">📄 Página 2</button> <!-- Botón Página 2 -->
        <button id="logoutBtn">Cerrar Sesión</button>
      </div>
    </div>
  `;

  // Eventos de navegación
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("historyBtn").onclick = () => showHistoryUtilsPage();
  document.getElementById("nuevoBtnUser").onclick = () => showNewHistoryPage();

  // ================================================
  // BOTONES NUEVAS PAGINAS
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();
  // ================================================

  document.getElementById("logoutBtn").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // ... Resto del código de usuario y dispositivo (sin cambios)

  // Datos del usuario autenticado
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");

    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore, "users", userId);

    onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      const rolTexto = data.isAdmin ? "Administrador" : "Usuario Normal";

      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "No registrado"}</p>
        <p><b>Correo:</b> ${userEmail}</p>
        <p><b>Teléfono:</b> ${data.telefono || "-"}</p>
        <p><b>Dirección:</b> ${data.direccion || "-"}</p>
        <p><b>Rol:</b> ${rolTexto}</p>
        <p><b>ID del Dispositivo:</b> ${data.deviceId || "No asignado"}</p>
        ${data.deviceId ? `<button id="verHistorialBtn">📜 Ver historial</button>` : ""}
      `;

      if (data.deviceId) {
        document.getElementById("verHistorialBtn").onclick = () => showHistoricalPage(data.deviceId);
        mostrarDatosDispositivo(data.deviceId);
      }

      // Rellenar formulario
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("telefono").value = data.telefono || "";
      document.getElementById("direccion").value = data.direccion || "";
      document.getElementById("deviceId").value = data.deviceId || "";
      document.getElementById("isAdmin").value = data.isAdmin ? "true" : "false";
    });

    // Guardar cambios del formulario
    document.getElementById("editForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombre").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const direccion = document.getElementById("direccion").value.trim();
      const deviceId = document.getElementById("deviceId").value.trim();
      const isAdmin = document.getElementById("isAdmin").value === "true";

      const newData = {
        nombre, telefono, direccion, deviceId, isAdmin,
        email: userEmail,
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(userDocRef, newData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), newData);

        if (deviceId) {
          const deviceRef = ref(db, `dispositivos/${deviceId}`);
          const deviceSnap = await get(deviceRef);
          if (deviceSnap.exists()) await update(deviceRef, { userEmail });
          else alert(`⚠️ El dispositivo "${deviceId}" no existe.`);
        }

        alert("✅ Datos actualizados correctamente.");
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
        await deleteDoc(userDocRef);
        await remove(ref(db, `usuarios/${userId}`));
        alert("🗑️ Usuario eliminado correctamente.");
        navigate("login");
      } catch (error) {
        console.error(error);
        alert(`❌ No se pudo borrar el usuario: ${error.message}`);
      }
    };

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
          <p>CO: ${d.CO ?? 0} ppm</p>
          <p>CO₂: ${d.CO2 ?? 0} ppm</p>
          <p>PM10: ${d.PM10 ?? 0} µg/m³</p>
          <p>PM2.5: ${d.PM2_5 ?? 0} µg/m³</p>
          <p>Humedad: ${d.humedad ?? 0}%</p>
          <p>Temperatura: ${d.temperatura ?? 0} °C</p>
          <button id="verHistorialBtn2">📜 Ver historial completo</button>
        `;
        document.getElementById("verHistorialBtn2").onclick = () => showHistoricalPage(deviceId);
      });
    }
  });
}

// ================================================
// DISPOSITIVOS
// ================================================
export function showDevices() {
  const root = document.getElementById("root");
  root.innerHTML = `
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
