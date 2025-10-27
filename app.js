// ================================================
// app.js — Navegación principal con navbar global
// ================================================
import { showLogin } from "./components/Login.js";
import { showRegister } from "./components/Register.js";
import { showUserDashboard } from "./components/UserDashboard.js";
import { showAdminDashboard } from "./components/AdminDashboard.js";
import { showAlerts } from "./components/AlertsView.js";
import { showDevices } from "./components/DeviceView.js";
import { renderNavbar } from "./components/navbar.js";

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
// FUNCIÓN GLOBAL DE NAVEGACIÓN
// ================================================
export function navigate(view) {
  root.innerHTML = "";

  // 🔹 Login y registro sin navbar
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

  // 🔹 En las demás páginas ocultar header y mostrar navbar
  document.querySelector("header").style.display = "none";

  // Insertar navbar
  const navbar = renderNavbar();
  root.appendChild(navbar);

  // Contenedor principal
  const content = document.createElement("div");
  content.className = "page-content";
  root.appendChild(content);

  // Mostrar vista
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
