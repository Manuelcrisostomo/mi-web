// ================================================
// userDashboard.js — Gestión de Usuario y Tipos de Mina (Optimizado)
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

// ================================================
// FUNCIÓN PRINCIPAL: DASHBOARD DE USUARIO
// ================================================
export function showUserDashboard() {
  const root = document.getElementById("root");

  root.innerHTML = `
  <nav class="navbar navbar-dark bg-dark p-2">
    <div class="container-fluid d-flex flex-column">
      <a class="navbar-brand fw-bold mb-2" href="#">Minesafe 2</a>

      <div class="accordion" id="navbarAccordion">
        <!-- Dashboard -->
        <div class="accordion-item bg-dark border-0">
          <h2 class="accordion-header" id="headingDashboard">
            <button class="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDashboard">
              🏠 Dashboard
            </button>
          </h2>
          <div id="collapseDashboard" class="accordion-collapse collapse" data-bs-parent="#navbarAccordion">
            <div class="accordion-body p-1">
              <button class="btn btn-sm btn-outline-primary w-100 mb-1" id="navDashboard">Inicio</button>
            </div>
          </div>
        </div>

        <!-- Dispositivos -->
        <div class="accordion-item bg-dark border-0">
          <h2 class="accordion-header" id="headingDevices">
            <button class="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDevices">
              💡 Dispositivos
            </button>
          </h2>
          <div id="collapseDevices" class="accordion-collapse collapse" data-bs-parent="#navbarAccordion">
            <div class="accordion-body p-1">
              <button class="btn btn-sm btn-outline-primary w-100 mb-1" id="navDevices">Ver Dispositivos</button>
              <button class="btn btn-sm btn-outline-primary w-100 mb-1" id="navHistorialCompleto">Historial Completo</button>
              <button class="btn btn-sm btn-outline-primary w-100 mb-1" id="navHistorialManage">Gestión de Historial</button>
            </div>
          </div>
        </div>

        <!-- Formularios -->
        <div class="accordion-item bg-dark border-0">
          <h2 class="accordion-header" id="headingForms">
            <button class="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseForms">
              👤 Formularios
            </button>
          </h2>
          <div id="collapseForms" class="accordion-collapse collapse" data-bs-parent="#navbarAccordion">
            <div class="accordion-body p-1">
              <button class="btn btn-sm btn-outline-success w-100 mb-1" id="navUserForm">Datos Personales</button>
              <button class="btn btn-sm btn-outline-success w-100 mb-1" id="navTipoMina">Tipo de Mina</button>
              <button class="btn btn-sm btn-outline-success w-100 mb-1" id="navGeoEmpresa">Geo / Empresa</button>
            </div>
          </div>
        </div>

        <!-- Admin / Otros -->
        <div class="accordion-item bg-dark border-0">
          <h2 class="accordion-header" id="headingAdmin">
            <button class="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAdmin">
              🛠️ Administración
            </button>
          </h2>
          <div id="collapseAdmin" class="accordion-collapse collapse" data-bs-parent="#navbarAccordion">
            <div class="accordion-body p-1">
              <button class="btn btn-sm btn-outline-warning w-100 mb-1" id="navAdmin">Panel Admin</button>
              <button class="btn btn-sm btn-outline-warning w-100 mb-1" id="navUsuarios">Usuarios</button>
              <button class="btn btn-sm btn-outline-warning w-100 mb-1" id="navGraficos">Gráficos</button>
              <button class="btn btn-sm btn-outline-warning w-100 mb-1" id="navGeolocalizacion">Mapa</button>
            </div>
          </div>
        </div>
      </div>

      <button class="btn btn-danger mt-2 w-100" id="logout">Cerrar Sesión</button>
  </nav>

  <div class="dashboard container mt-4">
    <h2>Perfil del Usuario</h2>
    <div id="userProfile" class="card p-3 mb-3"></div>

    <h3>Editar Datos del Usuario</h3>
    <form id="editForm" class="card p-3">
      <h4>Datos Personales</h4>
      <label>Nombre:</label><input type="text" id="nombre" placeholder="Nombre completo" class="form-control mb-2" />
      <label>Teléfono:</label><input type="text" id="telefono" placeholder="Teléfono" class="form-control mb-2" />
      <label>Dirección:</label><input type="text" id="direccion" placeholder="Dirección" class="form-control mb-2" />
      <label>ID del Dispositivo:</label><input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" class="form-control mb-2" />

      <h4>Tipo de Mina</h4>
      <select id="tipoMina" class="form-select mb-3">
        <option value="">Seleccione tipo...</option>
        <option value="subterranea">⛏️ Subterránea</option>
        <option value="tajo_abierto">🪨 Tajo Abierto</option>
        <option value="aluvial">💧 Aluvial</option>
        <option value="cantera">🏗️ Cantera</option>
        <option value="pirquen">🧰 Pirquén</option>
      </select>
      <div id="camposMina" class="mb-3"></div>

      <h4>Datos Geográficos / Empresariales</h4>
      <label>País:</label><input type="text" id="geoPais" placeholder="País" class="form-control mb-2" />
      <label>Región:</label><input type="text" id="geoRegion" placeholder="Región" class="form-control mb-2" />
      <label>Comuna:</label><input type="text" id="geoComuna" placeholder="Comuna" class="form-control mb-2" />
      <label>Nombre de la mina:</label><input type="text" id="geoMina" placeholder="Nombre de la mina" class="form-control mb-2" />
      <label>Nombre de la empresa:</label><input type="text" id="geoEmpresa" placeholder="Nombre de la empresa" class="form-control mb-2" />

      <div class="d-flex justify-content-between mt-3">
        <button type="submit" class="btn btn-success">💾 Guardar Cambios</button>
        <button type="button" id="deleteUser" class="btn btn-danger">🗑️ Borrar Usuario</button>
      </div>
    </form>

    <h3 class="mt-4">Dispositivo Asignado</h3>
    <div id="deviceData" class="card p-3">Cargando dispositivo...</div>
  </div>
  `;

  // ================================================
  // NAVBAR EVENTOS
  // ================================================
  document.getElementById("navUsuarios").onclick = () => navigate("usuarios");
  document.getElementById("navGraficos").onclick = () => navigate("graficos");
  document.getElementById("navGeolocalizacion").onclick = () => navigate("geolocalizacion");
  document.getElementById("navDashboard").onclick = () => navigate("dashboard");
  document.getElementById("navDevices").onclick = () => navigate("devices");
  document.getElementById("navHistorialCompleto").onclick = async () => {
    const user = auth.currentUser;
    if (!user) return alert("No hay usuario autenticado.");
    const userSnap = await get(ref(db, `usuarios/${user.uid}`));
    const userData = userSnap.val();
    if (userData?.deviceId) showHistoricalPage(userData.deviceId);
    else alert("Este usuario no tiene un dispositivo asignado.");
  };
  document.getElementById("navHistorialManage").onclick = () => {
    if (typeof showHistoryUtilsPage === "function") showHistoryUtilsPage();
    else alert("⚠️ La función 'showHistoryUtilsPage()' aún no está implementada.");
  };
  document.getElementById("navUserForm").onclick = () => navigate("userform");
  document.getElementById("navTipoMina").onclick = () => navigate("tipomina");
  document.getElementById("navGeoEmpresa").onclick = () => navigate("geoempresa");
  document.getElementById("navAdmin").onclick = () => navigate("admin");
  document.getElementById("logout").onclick = async () => { await auth.signOut(); navigate("login"); };

  // ================================================
  // RENDER CAMPOS SEGÚN TIPO DE MINA
  // ================================================
  const tipoSelect = document.getElementById("tipoMina");
  const camposMinaDiv = document.getElementById("camposMina");

  tipoSelect.addEventListener("change", (e) => renderCampos(e.target.value));

  function renderCampos(tipo) {
    let html = "";
    switch (tipo) {
      case "subterranea":
        html = `
          <label>Zona:</label><input id="zona" class="form-control mb-2" placeholder="Zona" />
          <label>Rampa:</label><input id="rampa" class="form-control mb-2" placeholder="Rampa" />
          <label>Galería:</label><input id="galeria" class="form-control mb-2" placeholder="Galería" />
          <label>Sector:</label><input id="sector" class="form-control mb-2" placeholder="Sector" />
        `;
        break;
      case "tajo_abierto":
        html = `
          <label>Banco:</label><input id="banco" class="form-control mb-2" placeholder="Banco" />
          <label>Fase:</label><input id="fase" class="form-control mb-2" placeholder="Fase" />
          <label>Frente:</label><input id="frente" class="form-control mb-2" placeholder="Frente" />
        `;
        break;
      default: html = "";
    }
    camposMinaDiv.innerHTML = html;
  }

  // ================================================
  // AUTENTICACIÓN Y DATOS DE USUARIO
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
      `;
      tipoSelect.value = data.tipoMina || "";
      renderCampos(tipoSelect.value);
    });

    // --- Guardar datos ---
    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();
      const updatedData = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        deviceId: document.getElementById("deviceId").value.trim(),
        tipoMina: tipoSelect.value,
        geoPais: document.getElementById("geoPais").value.trim(),
        geoRegion: document.getElementById("geoRegion").value.trim(),
        geoComuna: document.getElementById("geoComuna").value.trim(),
        geoMina: document.getElementById("geoMina").value.trim(),
        geoEmpresa: document.getElementById("geoEmpresa").value.trim(),
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

    // --- Mostrar dispositivo asignado ---
    const deviceId = (await get(ref(db, `usuarios/${user.uid}`))).val()?.deviceId;
    if (deviceId) mostrarDatosDispositivo(deviceId, document.getElementById("deviceData"));
  });
}

// ================================================
// FUNCIÓN UNIFICADA: MOSTRAR DATOS DE DISPOSITIVO
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
      <button id="verHistorialBtn">📜 Ver historial completo</button>
    `;
    mostrarHistorialCarrusel(deviceId);
    document.getElementById("verHistorialBtn").onclick = () => showHistoricalPage(deviceId);
  });
}

// ================================================
// HISTORIAL CARRUSEL (ÚLTIMOS 10 REGISTROS)
// ================================================
function mostrarHistorialCarrusel(deviceId) {
  const histRef = ref(db, `history/${deviceId}`);
  onValue(histRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const sorted = Object.entries(data)
      .sort((a, b) => b[0] - a[0])
      .slice(0, 10)
      .map(([ts, val]) => `<p>${new Date(parseInt(ts)).toLocaleString("es-CL")} - CO: ${val.CO}, PM10: ${val.PM10}</p>`)
      .join("");
    document.getElementById("historialCarrusel").innerHTML = sorted;
  });
}

// ================================================
// FUNCIONES AUXILIARES
// ================================================
async function showHistoricalPage(deviceId) {
  if (typeof showAllDevices === "function") showAllDevices(deviceId);
  else alert("⚠️ La función 'showAllDevices()' aún no está implementada.");
}
