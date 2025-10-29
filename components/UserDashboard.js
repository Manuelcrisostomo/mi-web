// ================================================
// userDashboard.js — Panel de usuario con navbar Bootstrap + modo oscuro/claro
// ================================================
import { auth, firestore, onAuthStateChanged } from "../firebaseConfig.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { navigate } from "../app.js";

export function showUserDashboard() {
  const root = document.getElementById("root");

  root.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-warning" href="#">⚙️ Minesafe 2</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
        aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><button class="nav-link btn-link" data-view="userform">👤 Datos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="tipomina">⛏️ Mina</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="geoempresa">🌍 Empresa</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="devices">💡 Dispositivos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="alerts">🚨 Alertas</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="history">📜 Historial</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="manager">🗂️ Manage</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="usuarios">👥 Usuarios</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="graficos">📊 Gráficos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="geolocalizacion">📍 Mapa</button></li>
        </ul>
        <div class="d-flex">
          <button id="themeToggle" class="btn btn-warning btn-sm me-2">🌙</button>
          <button class="btn btn-danger btn-sm logout">🔒 Cerrar Sesión</button>
        </div>
      </div>
    </div>
  </nav>

  <div class="container py-3">
    <div class="dashboard">
      <h2 class="fw-bold">Perfil del Usuario</h2>
      <div id="userProfile" class="card p-3 mb-3 shadow-sm"></div>

      <h3>Editar Datos</h3>
      <form id="editForm" class="card p-3 shadow-sm">
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

        <button type="submit" class="btn btn-primary mt-2">💾 Guardar</button>
        <button type="button" id="deleteUser" class="btn btn-danger mt-2">🗑️ Eliminar</button>
      </form>

      <h3 class="mt-4">Dispositivo Asignado</h3>
      <div id="deviceData" class="card p-3 shadow-sm">Cargando dispositivo...</div>
    </div>
  </div>
  `;

  // ==================== NAVBAR NAVIGATION ====================
  document.querySelectorAll("button[data-view]").forEach(btn => {
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
        html = `
          <label>Zona:</label><input id="zona" />
          <label>Rampa:</label><input id="rampa" />
          <label>Galería:</label><input id="galeria" />
          <label>Sector:</label><input id="sector" />
        `;
        break;
      case "tajo_abierto":
        html = `
          <label>Banco:</label><input id="banco" />
          <label>Fase:</label><input id="fase" />
          <label>Frente:</label><input id="frente" />
        `;
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
        <p><b>Tipo de mina:</b> ${data.tipoMina || "-"}</p>
      `;
    });
  });
}
  // ==================== DATOS DEL DISPOSITIVO ==================== 