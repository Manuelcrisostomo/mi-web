import { showLogin } from "./components/Login.js";
import { showRegister } from "./components/Register.js";
import { showUserDashboard } from "./components/UserDashboard.js";
import { showAdminDashboard } from "./components/AdminDashboard.js";
import { showAlerts } from "./components/AlertsView.js";
import { showDevices } from "./components/DeviceView.js";

// 👈 Importar las páginas adicionales
import { showPagina1 } from "./components/Pagina1.js";
import { showPagina2 } from "./components/Pagina2.js";

// Intentamos importar showAllDevices solo si existe
let showAllDevicesFunc = null;
try {
  const module = await import("./components/deviceHistory.js");
  showAllDevicesFunc = module.showAllDevices;
} catch (error) {
  console.warn("No se pudo cargar deviceHistory.js:", error);
}

const root = document.getElementById("root");

export function navigate(view, params = null) {
  root.innerHTML = "";

  if (view === "login") showLogin();
  else if (view === "register") showRegister();
  else if (view === "user") showUserDashboard();
  else if (view === "admin") showAdminDashboard();
  else if (view === "alerts") showAlerts();
  else if (view === "devices") {
    showDevices();

    // Agregar botones para páginas adicionales
    const deviceActionsDiv = document.querySelector(".actions");
    if (deviceActionsDiv) {
      const btn1 = document.createElement("button");
      btn1.textContent = "📄 Página 1";
      btn1.onclick = () => navigate("pagina1");
      deviceActionsDiv.appendChild(btn1);

      const btn2 = document.createElement("button");
      btn2.textContent = "📄 Página 2";
      btn2.onclick = () => navigate("pagina2");
      deviceActionsDiv.appendChild(btn2);
    }
  }
  else if (view === "history") {
    if (showAllDevicesFunc) showAllDevicesFunc();
    else root.innerHTML = "<p>⚠️ Función de historial no disponible.</p>";
  }
  else if (view === "pagina1") showPagina1();
  else if (view === "pagina2") showPagina2();
}

// Vista inicial
navigate("login");
