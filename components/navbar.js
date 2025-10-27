// ================================================
// Navbar.js — Barra de navegación global reutilizable
// ================================================
import { auth } from "../firebaseConfig.js";
import { navigate } from "../app.js";

export function renderNavbar() {
  const nav = document.createElement("nav");
  nav.className = "main-navbar";
  nav.innerHTML = `
    <div class="navbar-container">
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
  `;

  // Navegación
  nav.querySelectorAll("button[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => navigate(btn.dataset.view));
  });

  // Logout
  nav.querySelector("#logoutBtn").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  return nav;
}
