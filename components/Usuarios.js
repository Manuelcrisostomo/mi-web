// ================================================
// Usuarios.js — Lista de usuarios en Firebase con navbar desplegable
// ================================================
import { db, ref, onValue, auth } from "../firebaseConfig.js";
import { navigate } from "../app.js";

// Variable global para guardar la última vista
let lastView = "user"; // por defecto al inicio

export function showUsuarios(previousView = "user") {
  lastView = previousView; // guardamos la vista anterior

  const root = document.getElementById("root");
  root.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-warning" href="#">👥 Usuarios</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navUsuarios"
        aria-controls="navUsuarios" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navUsuarios">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><button class="nav-link btn-link" data-view="user">🏠 Inicio</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="devices">💡 Dispositivos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="graficos">📊 Gráficos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="geolocalizacion">📍 Mapa</button></li>
        </ul>
        <div class="d-flex">
          <button id="back" class="btn btn-secondary btn-sm me-2">⬅️ Volver</button>
          <button id="themeToggle" class="btn btn-warning btn-sm me-2">🌙</button>
          <button class="btn btn-danger btn-sm logout">🚪 Cerrar Sesión</button>
        </div>
      </div>
    </div>
  </nav>

  <div class="container py-3">
    <h2>👥 Usuarios Registrados</h2>
    <div id="usuariosList" class="card p-3">Cargando usuarios...</div>
  </div>
  `;

  // Navegación navbar
  document.querySelectorAll("button[data-view]").forEach(btn =>
    btn.addEventListener("click", () => navigate(btn.dataset.view))
  );

  // Botón Volver → regresa a la última vista guardada
  document.getElementById("back").onclick = () => navigate(lastView);

  // Logout
  document.querySelector(".logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // Tema oscuro
  const themeBtn = document.getElementById("themeToggle");
  themeBtn.onclick = () => {
    document.body.classList.toggle("dark-mode");
    themeBtn.textContent = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  };
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.textContent = "🌞";
  }

  // Carga dinámica de usuarios desde Firebase
  const usuariosRef = ref(db, "usuarios");
  onValue(usuariosRef, (snapshot) => {
    const data = snapshot.val();
    const cont = document.getElementById("usuariosList");
    if (!data) return (cont.innerHTML = "<p>No hay usuarios registrados.</p>");
    cont.innerHTML = Object.entries(data)
      .map(([id, u]) => `<p>👤 <b>${u.nombre}</b> — ${u.email}</p>`)
      .join("");
  });
}
