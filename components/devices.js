// ================================================
// IMPORTACIONES Y CONFIGURACIÓN
// ================================================

// Importamos funciones necesarias de Firebase y navegación
import {
  auth, db, firestore, ref, onValue, get, remove, onAuthStateChanged
} from "../firebaseConfig.js";

import { doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";

// Importamos páginas auxiliares para historial y navegación
import { showHistoryUtilsPage } from "./historyUtils.js";
import { showNewHistoryPage } from "./Histors.js";
import { showPagina1, showPagina2 } from "./paginas.js";
import { showHistoryManagerPage } from "./historyManager.js";

// ================================================
// PANEL ADMINISTRADOR
// ================================================
export function showAdminDashboard() {
  const root = document.getElementById("root");

  // HTML del panel principal del administrador
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

  // Mostramos todos los usuarios registrados en Realtime Database
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

  // Eventos de botones del panel
  document.getElementById("logout").onclick = async () => {
    await auth.signOut(); // Cierra sesión
    navigate("login"); // Redirige a login
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

  // HTML principal del panel del usuario
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
      
        <!-- Rol mostrado en lugar de select para que no sea editable -->
        <label>Rol:</label>
        <p id="rolAsignado">Cargando...</p>

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

      <!-- Sección de dispositivo asignado con datos y ubicación -->
      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card">Cargando dispositivo...</div>

      <!-- Botones de navegación y acciones -->
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
        html = `<h4>Datos Humanos (Operador)</h4>
                <label>Zona:</label><input type="text" id="zona" placeholder="Zona" />
                <label>Rampa:</label><input type="text" id="rampa" placeholder="Rampa" />
                <label>Galería:</label><input type="text" id="galeria" placeholder="Galería" />
                <label>Sector:</label><input type="text" id="sector" placeholder="Sector" />
                <label>Nombre de estación:</label><input type="text" id="nombreEstacion" placeholder="Nombre de estación" />`; break;
      case "tajo_abierto":
        html = `<h4>Datos Humanos (Operador)</h4>
                <label>Banco:</label><input type="text" id="banco" placeholder="Banco o nivel" />
                <label>Frente:</label><input type="text" id="frente" placeholder="Frente de trabajo" />
                <label>Zona:</label><input type="text" id="zona" placeholder="Zona" />
                <label>Sector:</label><input type="text" id="sector" placeholder="Sector" />`; break;
      case "aluvial":
        html = `<h4>Datos Humanos (Operador)</h4>
                <label>Mina:</label><input type="text" id="mina" placeholder="Nombre de la mina o sitio" />
                <label>Río:</label><input type="text" id="rio" placeholder="Río o tramo" />
                <label>Cuadrante:</label><input type="text" id="cuadrante" placeholder="Cuadrante o punto" />`; break;
      case "cantera":
        html = `<h4>Datos Humanos (Operador)</h4>
                <label>Cantera:</label><input type="text" id="cantera" placeholder="Nombre de la cantera" />
                <label>Material:</label><input type="text" id="material" placeholder="Material extraído" />
                <label>Frente:</label><input type="text" id="frente" placeholder="Frente activo" />`; break;
      case "pirqen":
        html = `<h4>Datos Humanos (Operador)</h4>
                <label>Faena:</label><input type="text" id="faena" placeholder="Nombre de faena" />
                <label>Tipo de explotación:</label><input type="text" id="tipoExplotacion" placeholder="Tipo de explotación" />
                <label>Sector:</label><input type="text" id="sector" placeholder="Sector" />
                <label>Nivel:</label><input type="text" id="nivel" placeholder="Nivel (si aplica)" />`; break;
    }
    camposMinaDiv.innerHTML = html; // Inserta los campos dinámicamente
  });

  // ===== Eventos de botones principales =====
  document.getElementById("logoutBtn").onclick = async () => { await auth.signOut(); navigate("login"); };
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("historyBtn").onclick = () => showHistoryUtilsPage();
  document.getElementById("nuevoBtnUser").onclick = () => showNewHistoryPage();
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();

  // ===== Sincronización de datos en tiempo real =====
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");
    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore, "users", userId);

    // Escucha cambios en Firestore
    onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      const rolTexto = data.isAdmin ? "Administrador" : "Usuario Normal";

      // Perfil mostrado arriba del formulario
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "No registrado"}</p>
        <p><b>Correo:</b> ${userEmail}</p>
        <p><b>Teléfono:</b> ${data.telefono || "-"}</p>
        <p><b>Dirección:</b> ${data.direccion || "-"}</p>
        <p><b>Rol:</b> ${rolTexto}</p>
        <p><b>ID del Dispositivo:</b> ${data.deviceId || "No asignado"}</p>
      `;

      // Rellenar campos del formulario
      const fields = ["nombre","telefono","direccion","deviceId",
                      "zona","rampa","galeria","sector","nombreEstacion",
                      "latitude","longitude","altitude","precision","EPSG",
                      "pais","region","comuna","nombreEmpresa"];
      fields.forEach(f => {
        const el = document.getElementById(f);
        if (!el) return;
        if (f === "isAdmin") el.value = data.isAdmin ? "true" : "false";
        else if (["latitude","longitude","altitude","precision"].includes(f)) el.value = data[f] ?? 0;
        else el.value = data[f] || "";
      });

      if (data.deviceId) mostrarDatosDispositivo(data.deviceId);
    });

    // ===== Guardar cambios del usuario =====
    document.getElementById("editForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const newData = {};
      const fields = ["nombre","telefono","direccion","deviceId",
                      "zona","rampa","galeria","sector","nombreEstacion",
                      "latitude","longitude","altitude","precision","EPSG",
                      "pais","region","comuna","nombreEmpresa"];
      fields.forEach(f => {
        const el = document.getElementById(f);
        if (!el) return;
        if (f === "isAdmin") newData[f] = el.value === "true";
        else if (["latitude","longitude","altitude","precision"].includes(f)) newData[f] = parseFloat(el.value) || 0;
        else newData[f] = el.value.trim();
      });
      newData.email = userEmail;
      newData.updatedAt = new Date().toISOString();

      try {
        // Guardamos en Firestore y Realtime Database
        await setDoc(doc(firestore, "users", userId), newData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), newData);
        if (newData.deviceId) mostrarDatosDispositivo(newData.deviceId);
        alert("✅ Datos actualizados correctamente.");
      } catch (error) {
        console.error(error);
        alert(`❌ Error al guardar: ${error.message}`);
      }
    });

    // ===== Borrar usuario =====
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
  });
}

// ================================================
// FUNCIONES DE DISPOSITIVOS E HISTORIALES
// ================================================
function mostrarDatosDispositivo(deviceId, container = document.getElementById("deviceData")) {
  const deviceRef = ref(db, `dispositivos/${deviceId}`);
  onValue(deviceRef, (snapshot) => {
    const d = snapshot.val();
    if (!d) return (container.innerHTML = `<p>No se encontró el dispositivo: <b>${deviceId}</b></p>`);

    // Datos del dispositivo mostrado en el panel de usuario
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
      <button id="verHistorialBtn2">📜 Ver historial completo</button>
    `;
    mostrarHistorialCarrusel(deviceId);
    document.getElementById("verHistorialBtn2").onclick = () => showHistoricalPage(deviceId);
  });
}

// Función que muestra los últimos registros en carrusel
function mostrarHistorialCarrusel(deviceId) {
  const historialRef = ref(db, `dispositivos/${deviceId}/historial`);
  onValue(historialRef, (snapshot) => {
    const historial = snapshot.val();
    const carrusel = document.getElementById("historialCarrusel");
    carrusel.innerHTML = "";

    if (!historial) return (carrusel.innerHTML = "<p>No hay datos históricos.</p>");

    Object.entries(historial)
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // Orden descendente
      .slice(0, 12) // Solo los últimos 12
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
