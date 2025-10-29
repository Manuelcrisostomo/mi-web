// ================================================
// Pagina2.js — Página 2 con navbar y botón volver
// ================================================
import { navigate } from "../app.js";

export function showPagina2() {
  const root = document.getElementById("root");
  root.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-warning" href="#">📄 Página 2</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navPage2">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navPage2">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><button class="nav-link btn-link" data-view="user">🏠 Inicio</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="devices">💡 Dispositivos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="alerts">🚨 Alertas</button></li>
        </ul>
        <div class="d-flex">
          <button class="btn btn-danger btn-sm logout">🚪 Cerrar Sesión</button>
        </div>
      </div>
    </div>
  </nav>

  <div class="container mt-4">
    <h2>Página 2</h2>
    <p>Ingresa texto aquí</p>
    <button id="volverBtn" class="btn btn-secondary mt-2">⬅️ Volver</button>
  </div>
  `;

  // Navegación navbar
  root.querySelectorAll("button[data-view]").forEach(btn =>
    btn.addEventListener("click", () => navigate(btn.dataset.view))
  );

  // Logout
  document.querySelector(".logout").onclick = () => navigate("login");

  // Botón volver
  document.getElementById("volverBtn").onclick = () => navigate("devices");
}
