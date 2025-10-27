// ================================================
// app.js — Navegación principal con navbar dinámica
// ================================================
import { showLogin } from "./components/Login.js";
import { showRegister } from "./components/Register.js";
import { showUserDashboard } from "./components/UserDashboard.js";
import { showAdminDashboard } from "./components/AdminDashboard.js";
import { showAlerts } from "./components/AlertsView.js";
import { showDevices } from "./components/DeviceView.js";

// Formularios separados
import { showUserForm } from "./components/UserForm.js";
import { showTipoMinaForm } from "./components/TipoMinaForm.js";
import { showGeoEmpresaForm } from "./components/GeoEmpresaForm.js";

// Páginas adicionales
import { showPagina1 } from "./components/Pagina1.js";
import { showPagina2 } from "./components/Pagina2.js";

// Firebase
import { auth } from "./firebaseConfig.js";

// --- Historial opcional ---
let showAllDevicesFunc = null;
try {
  const module = await import("./components/deviceHistory.js");
  showAllDevicesFunc = module.showAllDevices;
} catch (error) {
  console.warn("No se pudo cargar deviceHistory.js:", error);
}

// --- Nodo raíz ---
const root = document.getElementById("root");

// ================================================
// FUNCIÓN PARA RENDERIZAR NAVBAR GLOBAL
// ================================================
function renderNavbar() {
  const header = document.createElement("nav");
  header.style.cssText = `
    background: #1f1f1f;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 6px;
    padding: 8px;
    color: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.4);
  `;

  header.innerHTML = `
    <span style="font-weight:bold; margin-right:15px;">⚙️ Minesafe 2</span>
    <button id="navUser" class="btnNav">🏠 Panel</button>
    <button id="navDevices" class="btnNav">💡 Dispositivos</button>
    <button id="navAlerts" class="btnNav">🚨 Alertas</button>
    <button id="navHistory" class="btnNav">📜 Historial</button>
    <button id="navUserForm" class="btnNav">👤 Datos</button>
    <button id="navTipoMina" class="btnNav">⛏️ Mina</button>
    <button id="navGeoEmpresa" class="btnNav">🌍 Empresa</button>
    <button id="navPagina1" class="btnNav">📄 Pág. 1</button>
    <button id="navPagina2" class="btnNav">📄 Pág. 2</button>
    <button id="navAdmin" class="btnNav">🛠️ Admin</button>
    <button id="navLogout" class="btnNav" style="background:#dc3545;">🚪 Cerrar Sesión</button>
  `;

  // Estilos de botones
  const style = document.createElement("style");
  style.textContent = `
    .btnNav {
      background: #333;
      border: none;
      color: white;
      padding: 6px 10px;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btnNav:hover {
      background: #007bff;
    }
  `;
  document.head.appendChild(style);

  // --- Eventos ---
  header.querySelector("#navUser").onclick = () => navigate("user");
  header.querySelector("#navDevices").onclick = () => navigate("devices");
  header.querySelector("#navAlerts").onclick = () => navigate("alerts");
  header.querySelector("#navHistory").onclick = () => navigate("history");
  header.querySelector("#navUserForm").onclick = () => navigate("userform");
  header.querySelector("#navTipoMina").onclick = () => navigate("tipomina");
  header.querySelector("#navGeoEmpresa").onclick = () => navigate("geoempresa");
  header.querySelector("#navPagina1").onclick = () => navigate("pagina1");
  header.querySelector("#navPagina2").onclick = () => navigate("pagina2");
  header.querySelector("#navAdmin").onclick = () => navigate("admin");

  header.querySelector("#navLogout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  return header;
}

// ================================================
// FUNCIÓN GLOBAL DE NAVEGACIÓN
// ================================================
export function navigate(view, params = null) {
  root.innerHTML = "";

  // No mostrar navbar en login ni registro
  if (view !== "login" && view !== "register") {
    root.appendChild(renderNavbar());
  }

  // --- Contenedor principal ---
  const content = document.createElement("div");
  content.style.padding = "20px";
  root.appendChild(content);

  switch (view) {
    case "login": showLogin(); break;
    case "register": showRegister(); break;
    case "user": showUserDashboard(); break;
    case "admin": showAdminDashboard(); break;
    case "alerts": showAlerts(); break;
    case "devices": showDevices(); break;

    // Formularios
    case "userform": showUserForm(); break;
    case "tipomina": showTipoMinaForm(); break;
    case "geoempresa": showGeoEmpresaForm(); break;

    // Historial
    case "history":
      showAllDevicesFunc
        ? showAllDevicesFunc()
        : (content.innerHTML = "<p>⚠️ Función de historial no disponible.</p>");
      break;

    // Páginas extra
    case "pagina1": showPagina1(); break;
    case "pagina2": showPagina2(); break;

    default:
      showLogin();
  }
}

// ================================================
// PANTALLA INICIAL
// ================================================
navigate("login");
