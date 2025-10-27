// ================================================
// userDashboard.js — Panel del Usuario (ACTUALIZADO)
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
    <!-- ================================================
         BARRA DE NAVEGACIÓN
         ================================================ -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
      <div class="container-fluid">
        <span class="navbar-brand fw-bold">⚙️ Panel del Usuario</span>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-light btn-sm" id="navUserForm">👤 Datos Personales</button>
          <button class="btn btn-outline-light btn-sm" id="navTipoMina">⛏️ Tipo de Mina</button>
          <button class="btn btn-outline-light btn-sm" id="navGeoEmpresa">🌍 Geo / Empresa</button>
          <button class="btn btn-outline-warning btn-sm" id="navDevices">🛰️ Dispositivos</button>
          <button class="btn btn-outline-info btn-sm" id="navAlerts">🚨 Alertas</button>
          <button class="btn btn-outline-success btn-sm" id="navHistorialCompleto">📜 Historial Completo</button>
          <button class="btn btn-outline-primary btn-sm" id="navHistorialManage">🗂️ Historial Manage</button>
          <button class="btn btn-outline-danger btn-sm" id="navLogout">🔒 Cerrar Sesión</button>
        </div>
      </div>
    </nav>

    <!-- ================================================
         CONTENIDO PRINCIPAL
         ================================================ -->
    <div class="dashboard container">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card p-3 mb-4 shadow-sm"></div>

      <h3>Editar Datos del Usuario</h3>
      <form id="editForm" class="card p-3 shadow-sm mb-4">
        <h4>Datos Personales</h4>
        <label>Nombre:</label><input type="text" id="nombre" placeholder="Nombre completo" />
        <label>Teléfono:</label><input type="text" id="telefono" placeholder="Teléfono" />
        <label>Dirección:</label><input type="text" id="direccion" placeholder="Dirección" />
        <label>ID del Dispositivo:</label><input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" />

        <h4>Tipo de Mina</h4>
        <select id="tipoMina">
          <option value="">Seleccione tipo...</option>
          <option value="subterranea">⛏️ Subterránea</option>
          <option value="tajo_abierto">🪨 Tajo Abierto</option>
          <option value="aluvial">💧 Aluvial</option>
          <option value="cantera">🏗️ Cantera</option>
          <option value="pirquen">🧰 Pirquén</option>
        </select>

        <div id="camposMina" class="mt-2"></div>

        <h4>Datos Técnicos</h4>
        <label>Latitud:</label><input type="number" step="0.000001" id="techLat" />
        <label>Longitud:</label><input type="number" step="0.000001" id="techLng" />
        <label>Altitud (m):</label><input type="number" step="0.1" id="techAlt" />
        <label>Precisión (m):</label><input type="number" step="0.01" id="techPrecision" />
        <label>EPSG/WGS84:</label><input type="text" id="techEPSG" placeholder="EPSG/WGS84" />

        <h4>Datos Geográficos / Empresariales</h4>
        <label>País:</label><input type="text" id="geoPais" />
        <label>Región:</label><input type="text" id="geoRegion" />
        <label>Comuna:</label><input type="text" id="geoComuna" />
        <label>Nombre de la mina:</label><input type="text" id="geoMina" />
        <label>Nombre de la empresa:</label><input type="text" id="geoEmpresa" />

        <button type="submit" class="btn btn-success mt-3">💾 Guardar Cambios</button>
        <button type="button" id="deleteUser" class="btn btn-danger mt-2">🗑️ Borrar Usuario</button>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card p-3 shadow-sm">Cargando dispositivo...</div>
    </div>
  `;

  // =====================================================
  // 🔹 NAVEGACIÓN SUPERIOR
  // =====================================================
  document.getElementById("navUserForm").onclick = () => navigate("userform");
  document.getElementById("navTipoMina").onclick = () => navigate("tipomina");
  document.getElementById("navGeoEmpresa").onclick = () => navigate("geoempresa");
  document.getElementById("navDevices").onclick = () => navigate("devices");
  document.getElementById("navAlerts").onclick = () => navigate("alerts");

  // 🔹 NUEVOS BOTONES DE HISTORIAL
  document.getElementById("navHistorialCompleto").onclick = () => navigate("history");
  document.getElementById("navHistorialManage").onclick = () => navigate("manager");

  document.getElementById("navLogout").onclick = async () => { 
    await auth.signOut(); 
    navigate("login"); 
  };

  // =====================================================
  // 🔹 CAMPOS SEGÚN TIPO DE MINA
  // =====================================================
  const camposMinaDiv = document.getElementById("camposMina");
  const tipoSelect = document.getElementById("tipoMina");

  function renderCampos(tipo) {
    let html = "";
    switch (tipo) {
      case "subterranea":
        html = `<h4>⛏️ Subterránea</h4>
          <label>Zona:</label><input id="zona" />
          <label>Rampa:</label><input id="rampa" />
          <label>Galería:</label><input id="galeria" />
          <label>Sector:</label><input id="sector" />
          <label>Estación:</label><input id="nombreEstacion" />`;
        break;
      case "tajo_abierto":
        html = `<h4>🪨 Tajo Abierto</h4>
          <label>Banco:</label><input id="banco" />
          <label>Fase:</label><input id="fase" />
          <label>Frente:</label><input id="frente" />
          <label>GPS:</label><input id="coordGPS" />`;
        break;
      case "aluvial":
        html = `<h4>💧 Aluvial</h4>
          <label>Mina:</label><input id="mina" />
          <label>Río:</label><input id="rio" />
          <label>Tramo:</label><input id="tramo" />
          <label>GPS:</label><input id="coordGPS" />`;
        break;
      case "cantera":
        html = `<h4>🏗️ Cantera</h4>
          <label>Cantera:</label><input id="cantera" />
          <label>Material:</label><input id="material" />
          <label>Frente:</label><input id="frente" />`;
        break;
      case "pirquen":
        html = `<h4>🧰 Pirquén</h4>
          <label>Faena:</label><input id="faena" />
          <label>Tipo Explotación:</label><input id="tipoExplotacion" />
          <label>Sector:</label><input id="sector" />`;
        break;
    }
    camposMinaDiv.innerHTML = html;
  }

  tipoSelect.addEventListener("change", e => renderCampos(e.target.value));

  // =====================================================
  // 🔹 CARGA Y GUARDADO DE DATOS DEL USUARIO
  // =====================================================
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

    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();
      const tipoMina = tipoSelect.value;
      const camposExtras = {};
      camposMinaDiv.querySelectorAll("input").forEach(i => camposExtras[i.id] = i.value.trim());

      const updatedData = {
        nombre: document.getElementById("nombre").value.trim(),
        tipoMina,
        ...camposExtras,
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
