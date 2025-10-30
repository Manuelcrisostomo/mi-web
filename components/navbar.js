// ================================================
// Navbar.js — Barra de navegación tipo acordeón + responsive
// ================================================
import { auth } from "../firebaseConfig.js";
import { navigate } from "../app.js";

export function renderNavbar() {
  const nav = document.createElement("nav");
  nav.className = "main-navbar";
  nav.innerHTML = `
    <div class="navbar-header">
      <span class="navbar-brand fw-bold text-warning">⚙️ Minesafe 2</span>
      <button class="navbar-toggler" id="navbarToggle">☰</button>
    </div>
    <div class="navbar-links collapse">
      <button data-view="user">🏠 Panel</button>
      <button data-view="devices">💡 Dispositivos</button>
      <button data-view="alerts">🚨 Alertas</button>
      <button data-view="usuarios">👥 Usuarios</button>
      <button data-view="graficos">📊 Gráficos</button>
      <button data-view="geolocalizacion">📍 Mapa</button>
      <button data-view="history">📜 Historial</button>
      <button data-view="userform">👤 Datos</button>
      <button data-view="tipomina">⛏️ Mina</button>
      <button data-view="geoempresa">🌍 Empresa</button>
      <button data-view="pagina1">📄 Pág. 1</button>
      <button data-view="pagina2">📄 Pág. 2</button>
      <button data-view="admin">🛠️ Admin</button>
      <button id="themeToggle" class="theme-toggle">🌙</button>
      <button id="logoutBtn" class="logout">🚪 Cerrar Sesión</button>
    </div>
  `;

  const linksContainer = nav.querySelector(".navbar-links");
  const toggleBtn = nav.querySelector("#navbarToggle");

  // Toggle hamburguesa
  toggleBtn.onclick = () => {
    linksContainer.classList.toggle("collapse");
  };

  // Navegación de botones
  nav.querySelectorAll("button[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Redirigir Admin a usuarios.js
      if (btn.dataset.view === "admin") {
        navigate("usuarios");
      } else {
        navigate(btn.dataset.view);
      }
      // Cerrar menu en móviles
      if (!linksContainer.classList.contains("collapse")) {
        linksContainer.classList.add("collapse");
      }
    });
  });

  // Logout
  nav.querySelector("#logoutBtn").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // 🌙 Cambiar tema
  const themeToggle = nav.querySelector("#themeToggle");
  themeToggle.onclick = () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = dark ? "🌞" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
  };
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "🌞";
  }

  return nav;
}
