// ================================================
// UserDashboard.js — Vista del usuario con formularios separados
// ================================================
import {
  auth, db, firestore, ref, onValue, remove, get, onAuthStateChanged
} from "../firebaseConfig.js";
import { doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";
import { renderUserForm } from "./UserForm.js";
import { renderTipoMinaForm, renderCamposMina } from "./TipoMinaForm.js";
import { renderDeviceAssigned } from "./DeviceAssigned.js";

export function showUserDashboard() {
  const root = document.getElementById("root");

  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card"></div>

      <h3>Editar Información</h3>
      <form id="editForm" class="card">
        ${renderUserForm()}
        ${renderTipoMinaForm()}

        <section class="form-section">
          <h4>Datos Técnicos (Mapas/Sistema)</h4>
          <label>Latitud:</label><input type="number" id="techLat" />
          <label>Longitud:</label><input type="number" id="techLng" />
          <label>Altitud (m):</label><input type="number" id="techAlt" />
          <label>Precisión (m):</label><input type="number" id="techPrecision" />
          <label>EPSG/WGS84:</label><input type="text" id="techEPSG" placeholder="EPSG/WGS84" />
        </section>

        <section class="form-section">
          <h4>Datos Geográficos / Empresariales</h4>
          <label>País:</label><input type="text" id="geoPais" />
          <label>Región:</label><input type="text" id="geoRegion" />
          <label>Comuna:</label><input type="text" id="geoComuna" />
          <label>Nombre de la mina:</label><input type="text" id="geoMina" />
          <label>Nombre de la empresa:</label><input type="text" id="geoEmpresa" />
        </section>

        <div class="actions">
          <button type="submit">💾 Guardar Cambios</button>
          <button type="button" id="deleteUser" class="delete-btn">🗑️ Eliminar Usuario</button>
        </div>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceSection" class="card">Cargando...</div>

      <div class="actions">
        <button id="alertsBtn">Ver Alertas</button>
        <button id="devicesBtn">Ver Dispositivos</button>
        <button id="logout">Cerrar Sesión</button>
      </div>
    </div>
  `;

  const tipoSelect = document.getElementById("tipoMina");
  const camposMinaDiv = document.getElementById("camposMina");
  tipoSelect.addEventListener("change", (e) => {
    camposMinaDiv.innerHTML = renderCamposMina(e.target.value);
  });

  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("logout").onclick = async () => { await auth.signOut(); navigate("login"); };

  onAuthStateChanged(auth, async (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");

    const userId = user.uid;
    const userDocRef = doc(firestore, "users", userId);
    const deviceSection = document.getElementById("deviceSection");

    onSnapshot(userDocRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Rol:</b> ${data.isAdmin ? "Administrador" : "Usuario"}</p>
        <p><b>Tipo de mina:</b> ${data.tipoMina || "-"}</p>
      `;
      tipoSelect.value = data.tipoMina || "";
      camposMinaDiv.innerHTML = renderCamposMina(tipoSelect.value);
      deviceSection.innerHTML = renderDeviceAssigned(data.deviceId);
    });
  });
}
