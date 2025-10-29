// ================================================
// userDashboard.js — Panel de usuario con diseño sobrio
//esta es la pagina principal 
//esta pagina tambien tiene la navbar principal 
// ================================================
// ================================================
// userDashboard.js — Panel de usuario con navbar moderna + modo oscuro/claro
// ================================================
import {
  auth,
  firestore,
  onAuthStateChanged
} from "../firebaseConfig.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { navigate } from "../app.js";

export function showUserDashboard() {
  const root = document.getElementById("root");

  root.innerHTML = `
    <nav class="main-navbar">
      <button data-view="userform">👤 Datos</button>
      <button data-view="tipomina">⛏️ Mina</button>
      <button data-view="geoempresa">🌍 Empresa</button>
      <button data-view="devices">💡 Dispositivos</button>
      <button data-view="alerts">🚨 Alertas</button>
      <button data-view="history">📜 Historial</button>
      <button data-view="manager">🗂️ Manage</button>
      <button data-view="usuarios">👥 Usuarios</button>
      <button data-view="graficos">📊 Gráficos</button>
      <button data-view="geolocalizacion">📍 Mapa</button>
      <button id="themeToggle" class="theme-toggle">🌙</button>
      <button class="logout">🔒 Cerrar Sesión</button>
    </nav>

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

        <button type="submit" class="btn-primary">💾 Guardar</button>
        <button type="button" id="deleteUser" class="btn-danger">🗑️ Eliminar</button>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card">Cargando dispositivo...</div>
    </div>
  `;

  // ==================== NAVEGACIÓN ====================
  document.querySelectorAll(".main-navbar button[data-view]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.view));
  });

  // Logout
  document.querySelector(".logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // ==================== TEMA OSCURO / CLARO ====================
  const themeBtn = document.getElementById("themeToggle");
  themeBtn.onclick = () => {
    document.body.classList.toggle("dark-mode");
    themeBtn.textContent = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
  };

  // ==================== CAMPOS DE MINA DINÁMICOS ====================
  const tipoSelect = document.getElementById("tipoMina");
  const camposMinaDiv = document.getElementById("camposMina");

  tipoSelect.addEventListener("change", (e) => {
    let html = "";
    switch (e.target.value) {
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
    }
    camposMinaDiv.innerHTML = html;
  });

  // ==================== PERFIL DE USUARIO ====================
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");
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
  // ==================== DATOS DEL DISPOSITIVO ==================== 