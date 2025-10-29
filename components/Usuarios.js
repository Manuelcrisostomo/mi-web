// ================================================
// Usuarios.js — Lista de usuarios en Firebase
// ================================================
import { db, ref, onValue } from "../firebaseConfig.js";

export function showUsuarios() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <nav class="main-navbar">
      <button data-view="user">🏠 Menú Principal</button>
      <button data-view="devices">💡 Dispositivos</button>
      <button data-view="graficos">📊 Gráficos</button>
      <button data-view="geolocalizacion">📍 Mapa</button>
      <button class="logout">🚪 Cerrar Sesión</button>
    </nav>

    <div class="dashboard">
      <h2>👥 Usuarios Registrados</h2>
      <div id="usuariosList" class="card">Cargando usuarios...</div>
    </div>
  `;

  document.querySelectorAll(".main-navbar button[data-view]").forEach(btn =>
    btn.addEventListener("click", () => navigate(btn.dataset.view))
  );

  const usuariosRef = ref(db, "usuarios");
  onValue(usuariosRef, (snapshot) => {
    const data = snapshot.val();
    const cont = document.getElementById("usuariosList");
    if (!data) return (cont.innerHTML = "<p>No hay usuarios registrados.</p>");
    cont.innerHTML = Object.entries(data)
      .map(([id, u]) => `<p><b>${u.nombre}</b> — ${u.email}</p>`)
      .join("");
  });
}

