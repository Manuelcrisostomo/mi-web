// ================================================
// navbar.js — Barra de navegación global
// ================================================
import { navigate } from "../app.js";
import { auth } from "../firebaseConfig.js";

export function renderNavbar() {
  const navbar = document.createElement("nav");
  navbar.className = "navbar";
  navbar.innerHTML = `
    <div class="navbar-container">
      <span class="navbar-brand">⚙️ Minesafe 2</span>
      <div class="navbar-links">
        <button id="navDashboard">🏠 Dashboard</button>
        <button id="navDevices">💡 Dispositivos</button>
        <button id="navAlerts">🚨 Alertas</button>
        <button id="navHistory">📜 Historial</button>
        <button id="navAdmin">🛠️ Admin</button>
        <button id="navLogout" class="logout-btn">Cerrar sesión</button>
      </div>
    </div>
  `;

  // --- Estilo básico inline o en CSS ---
  const style = document.createElement("style");
  style.textContent = `
    .navbar {
      background: #1f1f1f;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }
    .navbar-links button {
      background: #333;
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 5px;
      margin: 0 5px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .navbar-links button:hover {
      background: #007bff;
    }
    .logout-btn {
      background: #dc3545 !important;
    }
  `;
  document.head.appendChild(style);

  // --- Eventos de navegación ---
  navbar.querySelector("#navDashboard").onclick = () => navigate("dashboard");
  navbar.querySelector("#navDevices").onclick = () => navigate("devices");
  navbar.querySelector("#navAlerts").onclick = () => navigate("alerts");
  navbar.querySelector("#navHistory").onclick = () => navigate("historical");
  navbar.querySelector("#navAdmin").onclick = () => navigate("admin");
  navbar.querySelector("#navLogout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  return navbar;
}
