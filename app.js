// ================================================
// app.js — Navegación principal con navbar global
// ================================================
import { showLogin } from "./components/Login.js";
import { showRegister } from "./components/Register.js";
import { showUserDashboard } from "./components/UserDashboard.js";
import { showAdminDashboard } from "./components/AdminDashboard.js";
import { showAlerts } from "./components/AlertsView.js";
import { showDevices } from "./components/DeviceView.js";

// Formularios
import { showUserForm } from "./components/UserForm.js";
import { showTipoMinaForm } from "./components/TipoMinaForm.js";
import { showGeoEmpresaForm } from "./components/GeoEmpresaForm.js";

// Páginas extra
import { showPagina1 } from "./components/Pagina1.js";
import { showPagina2 } from "./components/Pagina2.js";

// Firebase Auth
import { auth } from "./firebaseConfig.js";

// Historial opcional
let showAllDevicesFunc = null;
try {
  const module = await import("./components/deviceHistory.js");
  showAllDevicesFunc = module.showAllDevices;
} catch (error) {
  console.warn("No se pudo cargar deviceHistory.js:", error);
}

const root = document.getElementById("root");

// ================================================
// NAVBAR GLOBAL (excepto login y register)
// ================================================
function renderNavbar() {
  const nav = document.createElement("nav");
  nav.className = "main-navbar";
  nav.innerHTML = `
    <div class="navbar-container">
      <span class="logo">⚙️ Minesafe 2</span>
      <div class="nav-buttons">
        <button data-view="user">🏠 Panel</button>
        <button data-view="devices">💡 Dispositivos</button>
        <button data-view="alerts">🚨 Alertas</button>
        <button data-view="history">📜 Historial</button>
        <button data-view="userform">👤 Datos</button>
        <button data-view="tipomina">⛏️ Mina</button>
        <button data-view="geoempresa">🌍 Empresa</button>
        <button data-view="pagina1">📄 Pág. 1</button>
        <button data-view="pagina2">📄 Pág. 2</button>
        <button data-view="admin">🛠️ Admin</button>
        <button id="logoutBtn" class="logout">🚪 Cerrar Sesión</button>
      </div>
    </div>
  `;

  nav.querySelectorAll("button[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.view));
  });

  nav.querySelector("#logoutBtn").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  return nav;
}

// ================================================
// FUNCIÓN GLOBAL DE NAVEGACIÓN
// ================================================
export function navigate(view, params = null) {
  root.innerHTML = "";

  // Login y registro SIN navbar
  if (view === "login") {
    document.querySelector("header").style.display = "flex";
    showLogin();
    return;
  }
  if (view === "register") {
    document.querySelector("header").style.display = "flex";
    showRegister();
    return;
  }

  // En las demás páginas, ocultar header fijo y usar navbar propia
  document.querySelector("header").style.display = "none";

  // Crear navbar dinámica
  const navbar = renderNavbar();
  root.appendChild(navbar);

  // Contenido principal
  const content = document.createElement("div");
  content.className = "page-content";
  root.appendChild(content);

  // --- Mostrar vista correspondiente ---
  switch (view) {
    case "user": showUserDashboard(); break;
    case "admin": showAdminDashboard(); break;
    case "alerts": showAlerts(); break;
    case "devices": showDevices(); break;
    case "userform": showUserForm(); break;
    case "tipomina": showTipoMinaForm(); break;
    case "geoempresa": showGeoEmpresaForm(); break;
    case "pagina1": showPagina1(); break;
    case "pagina2": showPagina2(); break;
    case "history":
      showAllDevicesFunc
        ? showAllDevicesFunc()
        : (content.innerHTML = "<p>⚠️ Historial no disponible.</p>");
      break;
    default:
      showLogin();
  }
}

// ================================================
// ARRANQUE DE APLICACIÓN
// ================================================
navigate("login");
