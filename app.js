// ================================================
// app.js — Navegación principal
// ================================================
import { showLogin } from "./components/Login.js";
import { showRegister } from "./components/Register.js";
import { showUserDashboard } from "./components/UserDashboard.js";
import { showAdminDashboard } from "./components/AdminDashboard.js";
import { showAlerts } from "./components/AlertsView.js";
import { showDevices } from "./components/DeviceView.js";
import { showUserForm } from "./components/UserForm.js";
import { showTipoMinaForm } from "./components/TipoMinaForm.js";
import { showDeviceAssigned } from "./components/DeviceAssigned.js";

// --- Carga opcional del historial (puede fallar sin romper)
let showAllDevicesFunc = null;
try {
  const module = await import("./components/deviceHistory.js");
  showAllDevicesFunc = module.showAllDevices;
} catch (error) {
  console.warn("No se pudo cargar deviceHistory.js:", error);
}

// --- Nodo raíz donde se pintan las vistas
const root = document.getElementById("root");

// --- Función global para navegación
export function navigate(view, params = null) {
  root.innerHTML = "";

  switch (view) {
    case "login":
      showLogin();
      break;
    case "register":
      showRegister();
      break;
    case "user":
      showUserDashboard();
      break;
    case "admin":
      showAdminDashboard();
      break;
    case "alerts":
      showAlerts();
      break;
    case "devices":
      showDevices();
      break;
    case "userform":
      showUserForm();
      break;
    case "tipomina":
      showTipoMinaForm();
      break;
    case "deviceassigned":
      showDeviceAssigned();
      break;
    case "history":
      if (showAllDevicesFunc) {
        showAllDevicesFunc();
      } else {
        root.innerHTML = "<p>⚠️ Función de historial no disponible.</p>";
      }
      break;
    default:
      showLogin();
      break;
  }
}

// --- Pantalla inicial por defecto
navigate("login");
