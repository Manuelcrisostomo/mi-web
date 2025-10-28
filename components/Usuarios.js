import { db, ref, onValue } from "../firebaseConfig.js";
import { renderNavbar } from "./navbar.js"; // Navbar global
import { navigate } from "../app.js";

export function showUsuarios() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Limpiamos el root

  // ==== NAVBAR GLOBAL ====
  const navbar = renderNavbar();
  root.appendChild(navbar);

  // ==== CONTENIDO PRINCIPAL ====
  const content = document.createElement("div");
  content.className = "page-content";
  content.innerHTML = `
    <div class="dashboard">
      <div class="actions mb-3">
        <button id="backBtn" class="btn-volver">⬅️ Volver</button>
      </div>
      <h2>👥 Usuarios Registrados</h2>
      <div id="usuariosList" class="card">Cargando usuarios...</div>
    </div>
  `;
  root.appendChild(content);

  // ==== BOTÓN VOLVER ====
  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    navigate("user"); // Cambia "user" según la página anterior que desees
  });

  // ==== CARGA DE USUARIOS ====
  const usuariosRef = ref(db, "usuarios");
  onValue(usuariosRef, (snapshot) => {
    const data = snapshot.val();
    const cont = document.getElementById("usuariosList");
    if (!data) {
      cont.innerHTML = "<p>No hay usuarios registrados.</p>";
      return;
    }

    cont.innerHTML = Object.entries(data)
      .map(([id, u]) => `
        <div class="card">
          <h4>${u.nombre || "Sin nombre"} (${u.email || "sin email"})</h4>
          <p><b>Tipo de mina:</b> ${u.tipoMina || "-"}</p>
          <p><b>Dispositivo:</b> ${u.deviceId || "—"}</p>
          <p><b>Ubicación:</b> ${u.geoComuna || "—"}, ${u.geoRegion || ""}</p>
        </div>
      `)
      .join("");
  });
}
// ================================================
// FIN DEL COMPONENTE USUARIOS
// ================================================