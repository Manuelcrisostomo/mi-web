// ================================================
// userDashboard.js — Panel de usuario con diseño sobrio
//esta es la pagina principal 
//esta pagina tambien tiene la navbar principal 
// ================================================
import {
  auth,
  db,
  firestore,
  ref,
  remove,
  onValue,
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
    <style>
      body {
        font-family: "Segoe UI", Arial, sans-serif;
        background-color: #ffffff;
        color: #111;
        margin: 0;
      }

      /* ===== NAVBAR NEGRA ===== */
      .navbar {
        background-color: #111;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 14px;
        border: 1px solid #444;
        border-radius: 4px;
        margin: 12px;
      }

      .navbar-brand {
        color: #ddd;
        font-weight: 600;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .navbar-brand::before {
        content: "⚙️";
      }

      .navbar-buttons {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .navbar button {
        border: 2px solid transparent;
        background: none;
        color: white;
        font-size: 0.85rem;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .navbar button:hover {
        transform: scale(1.05);
        opacity: 0.9;
      }

      /* Botones de color con bordes */
      .btn-data { border-color: #6f42c1; color: #cbb2ff; }
      .btn-mina { border-color: #0d6efd; color: #8dc6ff; }
      .btn-empresa { border-color: #20c997; color: #8ef3d1; }
      .btn-devices { border-color: #ffc107; color: #ffe07a; }
      .btn-alerts { border-color: #0dcaf0; color: #89e3f9; }
      .btn-history { border-color: #198754; color: #93f3b0; }
      .btn-manage { border-color: #ff8800; color: #ffd59e; }
      .btn-logout { border-color: #dc3545; color: #ffb3b8; }

      .btn-data:hover { background-color: #6f42c1; color: white; }
      .btn-mina:hover { background-color: #0d6efd; color: white; }
      .btn-empresa:hover { background-color: #20c997; color: white; }
      .btn-devices:hover { background-color: #ffc107; color: black; }
      .btn-alerts:hover { background-color: #0dcaf0; color: black; }
      .btn-history:hover { background-color: #198754; color: white; }
      .btn-manage:hover { background-color: #ff8800; color: black; }
      .btn-logout:hover { background-color: #dc3545; color: white; }

      /* ===== CONTENIDO ===== */
      .dashboard {
        background: #fff;
        color: #111;
        max-width: 850px;
        margin: 20px auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }

      h2, h3, h4 {
        color: #222;
        margin-top: 15px;
      }

      .card {
        background: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 12px 15px;
        margin-bottom: 15px;
      }

      label {
        display: block;
        font-weight: 600;
        margin-top: 8px;
        font-size: 0.9rem;
      }

      input, select {
        width: 100%;
        padding: 6px 8px;
        border-radius: 5px;
        border: 1px solid #ccc;
        margin-top: 4px;
        font-size: 0.9rem;
      }

      .btn-save {
        background: #198754;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        border: none;
        margin-top: 10px;
        cursor: pointer;
      }

      .btn-save:hover {
        background: #157347;
      }

      .btn-delete {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        margin-top: 8px;
        cursor: pointer;
      }

      .btn-delete:hover {
        background: #b02a37;
      }
    </style>

    <!-- ===== NAVBAR ===== -->
    <nav class="navbar">
      <div class="navbar-brand">Panel del Usuario</div>
      <div class="navbar-buttons">
        <button class="btn-data" id="navUserForm">👤 Datos Personales</button>
        <button class="btn-mina" id="navTipoMina">⛏️ Tipo de Mina</button>
        <button class="btn-empresa" id="navGeoEmpresa">🌍 Geo / Empresa</button>
        <button class="btn-devices" id="navDevices">💡 Dispositivos</button>
        <button class="btn-alerts" id="navAlerts">🚨 Alertas</button>
        <button class="btn-history" id="navHistorialCompleto">📜 Historial Completo</button>
        <button class="btn-manage" id="navHistorialManage">🗂️ Historial Manage</button>
        <button id="usuariosBtn">👥 Usuarios</button>
        <button id="graficosBtn">📊 Gráficos</button>
        <button id="geoBtn">📍 Mapa</button>

        <button class="btn-logout" id="navLogout">🔒 Cerrar Sesión</button>
      </div>
    </nav>

    <!-- ===== CONTENIDO ===== -->
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card"></div>

      <h3>Editar Datos</h3>
      <form id="editForm" class="card">
        <h4>Datos Personales</h4>
        <label>Nombre:</label><input type="text" id="nombre" />
        <label>Teléfono:</label><input type="text" id="telefono" />
        <label>Dirección:</label><input type="text" id="direccion" />
        <label>ID del Dispositivo:</label><input type="text" id="deviceId" />

        <h4>Tipo de Mina</h4>
        <select id="tipoMina">
          <option value="">Seleccione tipo...</option>
          <option value="subterranea">Subterránea</option>
          <option value="tajo_abierto">Tajo Abierto</option>
          <option value="aluvial">Aluvial</option>
          <option value="cantera">Cantera</option>
          <option value="pirquen">Pirquén</option>
        </select>
        <div id="camposMina"></div>

        <button type="submit" class="btn-save">💾 Guardar</button>
        <button type="button" id="deleteUser" class="btn-delete">🗑️ Eliminar</button>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card">Cargando dispositivo...</div>
    </div>
  `;

  // =====================================================
  // 🔹 NAVEGACIÓN SUPERIOR
  // =====================================================
  document.getElementById("usuariosBtn").onclick = () => navigate("usuarios");
  document.getElementById("graficosBtn").onclick = () => navigate("graficos");
  document.getElementById("geoBtn").onclick = () => navigate("geolocalizacion");

  document.getElementById("navUserForm").onclick = () => navigate("userform");
  document.getElementById("navTipoMina").onclick = () => navigate("tipomina");
  document.getElementById("navGeoEmpresa").onclick = () => navigate("geoempresa");
  document.getElementById("navDevices").onclick = () => navigate("devices");
  document.getElementById("navAlerts").onclick = () => navigate("alerts");
  document.getElementById("navHistorialCompleto").onclick = () => navigate("history");
  document.getElementById("navHistorialManage").onclick = () => navigate("manager");
  document.getElementById("navLogout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // =====================================================
  // 🔹 Resto de funciones (carga de datos)
  // =====================================================
  const tipoSelect = document.getElementById("tipoMina");
  const camposMinaDiv = document.getElementById("camposMina");

  function renderCampos(tipo) {
    let html = "";
    switch (tipo) {
      case "subterranea":
        html = `<label>Zona:</label><input id="zona" />
                <label>Rampa:</label><input id="rampa" />
                <label>Galería:</label><input id="galeria" />
                <label>Sector:</label><input id="sector" />`;
        break;
      case "tajo_abierto":
        html = `<label>Banco:</label><input id="banco" />
                <label>Fase:</label><input id="fase" />
                <label>Frente:</label><input id="frente" />`;
        break;
      default: html = "";
    }
    camposMinaDiv.innerHTML = html;
  }

  tipoSelect.addEventListener("change", (e) => renderCampos(e.target.value));

  onAuthStateChanged(auth, async (user) => {
    if (!user) return root.innerHTML = "<p>No hay usuario autenticado.</p>";
    const userDoc = doc(firestore, "users", user.uid);

    onSnapshot(userDoc, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Tipo de mina:</b> ${data.tipoMina || "-"}</p>`;
    });
  });
}
