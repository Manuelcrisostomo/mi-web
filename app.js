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
import { showUsuarios } from "./components/Usuarios.js";
import { showGraficos } from "./components/Graficos.js";
import { showGeolocalizacion } from "./components/Geolocalizacion.js";
import { auth } from "./firebaseConfig.js";
import { renderNavbar } from "./components/navbar.js";
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

  // Oculta header y muestra navbar
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
    case "usuarios": showUsuarios(); break;
    case "graficos": showGraficos(); break;
    case "geolocalizacion": showGeolocalizacion(); break;
    case "pagina1": showPagina1(); break;
    case "pagina2": showPagina2(); break;
    case "history":
      showAllDevicesFunc
        ? showAllDevicesFunc()
        : (content.innerHTML = "<p>⚠️ Historial no disponible.</p>");
      break;
    case "manager": showHistoryManagerPage(); break;
    default: showLogin();
  }
}

// ================================================
// ARRANQUE INICIAL
// ================================================
navigate("login");
