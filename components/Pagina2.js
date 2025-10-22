import { navigate } from "../app.js"; // Asegúrate de importar navigate

export function showPagina2() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <!-- Navbar Horizontal -->
    <nav class="navbar-horizontal">
      <a href="#" class="brand">EcoAsh Dashboard</a>
      <a href="#" id="navMainMenu" class="nav-link">Inicio</a>
      <a href="#" id="navDevices" class="nav-link">Dispositivos</a>
      <a href="#" id="navAlerts" class="nav-link">Alertas</a>
      <a href="#" id="navHistory" class="nav-link">Historial</a>
      <a href="#" id="navPage1" class="nav-link">Página 1</a>
      <a href="#" id="navPage2" class="nav-link active">Página 2</a>
      <button id="navLogout" class="btn-logout">Cerrar Sesión</button>
    </nav>

    <!-- Contenido principal -->
    <div class="dashboard">
      <h2>Página 2</h2>
      <p>Ingresa texto aquí</p>
      <button id="volverBtn">Volver</button>
    </div>
  `;

  // --- Navegación navbar
  document.getElementById("navMainMenu").onclick = () => navigate("dashboard");
  document.getElementById("navDevices").onclick = () => navigate("devices");
  document.getElementById("navAlerts").onclick = () => navigate("alerts");
  document.getElementById("navHistory").onclick = () => navigate("history");
  document.getElementById("navPage1").onclick = () => navigate("page1");
  document.getElementById("navPage2").onclick = () => navigate("page2");
  document.getElementById("navLogout").onclick = () => navigate("login");

  // Botón volver usando navigate
  document.getElementById("volverBtn").onclick = () => navigate("devices");
}
