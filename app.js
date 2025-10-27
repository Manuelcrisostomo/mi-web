// ================================================
// app.js — Navegación principal con navbar global
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
import { renderNavbar } from "./components/Navbar.js";

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
export function navigate(view, params = null) {
  root.innerHTML = "";

  // Mostrar login / registro SIN navbar
  if (view === "login" || view === "register") {
    document.querySelector("header").style.display = "flex";
    if (view === "login") showLogin();
    else showRegister();
    return;
  }

  // Ocultar header fijo y mostrar navbar global
  document.querySelector("header").style.display = "none";
  root.appendChild(renderNavbar());

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
        : (root.innerHTML += "<p>⚠️ Historial no disponible.</p>");
      break;
    default:
      showLogin();
  }
}

// ================================================
// ARRANQUE DE APLICACIÓN
// ================================================
navigate("login");
