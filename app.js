// ================================================
// app.js — Navegación principal
// ================================================
import { showLogin } from "./components/Login.js";
import { showRegister } from "./components/Register.js";
import { showUserDashboard } from "./components/UserDashboard.js";
import { showAdminDashboard } from "./components/AdminDashboard.js";
import { showAlerts } from "./components/AlertsView.js";
import { showDevices } from "./components/DeviceView.js";

// 👇 Nuevas vistas separadas (formularios)
import { showUserForm } from "./components/UserForm.js";
import { showTipoMinaForm } from "./components/TipoMinaForm.js";
import { showGeoEmpresaForm } from "./components/GeoEmpresaForm.js";

// 👇 Páginas adicionales
import { showPagina1 } from "./components/Pagina1.js";
import { showPagina2 } from "./components/Pagina2.js";

// 👇 Historial opcional
let showAllDevicesFunc = null;
try {
  const module = await import("./components/deviceHistory.js");
  showAllDevicesFunc = module.showAllDevices;
} catch (error) {
  console.warn("No se pudo cargar deviceHistory.js:", error);
}

const root = document.getElementById("root");

// ================================================
// Función global de navegación
// ================================================
export function navigate(view, params = null) {
  root.innerHTML = "";

  switch (view) {
    case "login": showLogin(); break;
    case "register": showRegister(); break;
    case "user": showUserDashboard(); break;
    case "admin": showAdminDashboard(); break;
    case "alerts": showAlerts(); break;
    case "devices": showDevices(); break;

    // Formularios separados
    case "userform": showUserForm(); break;
    case "tipomina": showTipoMinaForm(); break;
    case "geoempresa": showGeoEmpresaForm(); break;

    // Historial general
    case "history":
      showAllDevicesFunc
        ? showAllDevicesFunc()
        : root.innerHTML = "<p>⚠️ Función de historial no disponible.</p>";
      break;

    // Páginas extra
    case "pagina1": showPagina1(); break;
    case "pagina2": showPagina2(); break;

    default:
      showLogin();
  }
}

// ================================================
// Inicialización por defecto
// ================================================
navigate("login");
