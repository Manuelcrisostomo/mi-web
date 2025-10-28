import { db, ref, onValue } from "../firebaseConfig.js";

export function showUsuarios() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>👥 Usuarios Registrados</h2>
      <div id="usuariosList" class="card">Cargando usuarios...</div>
    </div>
  `;

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