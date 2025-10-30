// Pagina1.js — Página 1 con navbar y botón volver + Haki One Piece
import { navigate } from "../app.js";

export function showPagina1() {
  const root = document.getElementById("root");

  // Lista de Haki
  const hakis = ["Haki del Rey", "Haki de Observación", "Haki Armadura"];
  const elegido = hakis[Math.floor(Math.random() * hakis.length)];

  root.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-warning" href="#">📄 Página 1</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navPage1">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navPage1">
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

  <div class="secret-page">
    <div class="flag-container">
      <img src="assets/images/onepiece_banner.png" alt="One Piece" class="flag-anim">
    </div>
    <h2 class="secret-title">¡Felicidades!</h2>
    <p class="secret-text">Has encontrado la página escondida. Por tu esfuerzo has obtenido el <span class="haki-type">${elegido}</span> 🗡️</p>
    <button id="volverBtn" class="btn btn-secondary mt-3">⬅️ Volver</button>
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

  // Reproducir el audio del opening
  const audio = new Audio("assets/sounds/one-piece-intro.mp3");
  audio.volume = 0.7;
  audio.play();
}
