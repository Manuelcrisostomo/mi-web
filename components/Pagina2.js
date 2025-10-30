// Pagina2.js — Página secreta Mashle
import { navigate } from "../app.js";

export function showPagina2() {
  const root = document.getElementById("root");

  // Lista de personajes de Mashle
  const personajes = [
    { nombre: "Mash Burnedead", imagen: "assets/images/mash.png" },
    { nombre: "Lance Crown", imagen: "assets/images/lance.png" },
    { nombre: "Roe Two", imagen: "assets/images/roe.png" }
  ];

  // Elegir personaje aleatorio
  const elegido = personajes[Math.floor(Math.random() * personajes.length)];

  root.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-warning" href="#">📄 Página 2 - Mashle</a>
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

  <div class="secret-page">
    <div class="flag-container">
      <img src="${elegido.imagen}" alt="${elegido.nombre}" class="flag-anim">
    </div>
    <h2 class="secret-title">¡Felicidades!</h2>
    <p class="secret-text">
      Has encontrado la página secreta de Mashle. Tu personaje aleatorio es 
      <span class="haki-type">${elegido.nombre}</span> 💥
    </p>
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

  // Reproducir el audio de Mashle
  const audio = new Audio("https://www.myinstants.com/media/sounds/mashle-intro.mp3"); // enlace directo
  audio.volume = 0.7;
  audio.play();
}
