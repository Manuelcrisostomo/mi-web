// ================================================
// app.js — Navegación principal con navbar global estilizada
// ================================================
import { showLogin } from "./components/Login.js";
import { showRegister } from "./components/Register.js";
import { showUserDashboard } from "./components/UserDashboard.js";
import { showAdminDashboard } from "./components/AdminDashboard.js";
import { showAlerts } from "./components/AlertsView.js";
import { showDevices } from "./components/DeviceView.js";
import { showUserForm } from "./components/UserForm.js";
import { showTipoMinaForm } from "./components/TipoMinaForm.js";
import { showGeoEmpresaForm } from "./components/GeoEmpresaForm.js";
import { showPagina1 } from "./components/Pagina1.js";
import { showPagina2 } from "./components/Pagina2.js";
import { auth } from "./firebaseConfig.js";

// Historial
import { showHistoryManagerPage } from "./components/historyManager.js";

let showAllDevicesFunc = null;
try {
  const module = await import("./components/deviceHistory.js");
  showAllDevicesFunc = module.showAllDevices;
} catch (error) {
  console.warn("⚠️ No se pudo cargar deviceHistory.js:", error);
}

const root = document.getElementById("root");

// ================================================
// NAVBAR (NEGRA) — aparece en todas menos login/register
// ================================================
function renderNavbar() {
  const nav = document.createElement("nav");
  nav.className = "main-navbar";
  nav.innerHTML = `
    <span class="logo">⚙️ Panel del Usuario</span>
    <button data-view="userform">👤 Datos Personales</button>
    <button data-view="tipomina">⛏️ Tipo de Mina</button>
    <button data-view="geoempresa">🌍 Geo / Empresa</button>
    <button data-view="devices">💡 Dispositivos</button>
    <button data-view="alerts">🚨 Alertas</button>
    <button data-view="history">📜 Historial Completo</button>
    <button data-view="manager">🗂️ Historial Manage</button>
    <button class="logout">🔒 Cerrar Sesión</button>
  `;

  // Navegación entre vistas
  nav.querySelectorAll("button[data-view]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.view));
  });

  // Logout
  nav.querySelector(".logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  return nav;
}

// ================================================
// FUNCIÓN GLOBAL DE NAVEGACIÓN
// ================================================
export function navigate(view) {
  root.innerHTML = "";

  // Login y Registro → sin navbar
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

  // Oculta header principal y muestra navbar negra
  document.querySelector("header").style.display = "none";

  const navbar = renderNavbar();
  root.appendChild(navbar);

  const content = document.createElement("div");
  content.className = "page-content";
  root.appendChild(content);

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
    case "manager":
      showHistoryManagerPage();
      break;
    default:
      showLogin();
  }
}

// ================================================
// ARRANQUE INICIAL
// ================================================
navigate("login");
