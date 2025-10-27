// /components/UserDashboard.js
import {
  auth,
  db,
  firestore,
  ref,
  remove,
  update,
  onAuthStateChanged,
} from "../firebaseConfig.js";

import { doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { navigate } from "../app.js";

// Nuevos imports
import { renderUserForm } from "./UserForm.js";
import { renderTipoMinaForm, renderCamposMina } from "./TipoMinaForm.js";
import { mostrarDatosDispositivo } from "./DeviceAssigned.js";

export function showUserDashboard() {
  const root = document.getElementById("root");

  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card"></div>

      <h3>Editar Datos del Usuario</h3>
      <form id="editForm" class="card">
        ${renderUserForm()}
        ${renderTipoMinaForm()}
        
        <h4>Datos Técnicos</h4>
        <label>Latitud:</label><input type="number" step="0.000001" id="techLat" placeholder="Latitud" />
        <label>Longitud:</label><input type="number" step="0.000001" id="techLng" placeholder="Longitud" />
        <label>Altitud (m):</label><input type="number" id="techAlt" />
        <label>Precisión (m):</label><input type="number" id="techPrecision" />

        <h4>Datos Geográficos</h4>
        <label>País:</label><input type="text" id="geoPais" />
        <label>Región:</label><input type="text" id="geoRegion" />
        <label>Comuna:</label><input type="text" id="geoComuna" />
        <label>Nombre Mina:</label><input type="text" id="geoMina" />
        <label>Empresa:</label><input type="text" id="geoEmpresa" />

        <button type="submit">💾 Guardar Cambios</button>
        <button type="button" id="deleteUser" class="delete-btn">🗑️ Eliminar Usuario</button>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card">Cargando dispositivo...</div>

      <div class="actions">
        <button id="devicesBtn">Ver Dispositivos</button>
        <button id="logout">Cerrar Sesión</button>
      </div>
    </div>
  `;

  // --- Navegación
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // --- Campos dinámicos tipo de mina
  const tipoSelect = document.getElementById("tipoMina");
  const camposDiv = document.getElementById("camposMina");
  tipoSelect.addEventListener("change", (e) => {
    camposDiv.innerHTML = renderCamposMina(e.target.value);
  });

  // --- Cargar datos del usuario
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      root.innerHTML = "<p>No hay usuario autenticado.</p>";
      return;
    }

    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore, "users", userId);

    onSnapshot(userDocRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Email:</b> ${userEmail}</p>
        <p><b>Rol:</b> ${data.isAdmin ? "Administrador" : "Usuario"}</p>
        <p><b>Tipo Mina:</b> ${data.tipoMina || "-"}</p>
      `;

      tipoSelect.value = data.tipoMina || "";
      camposDiv.innerHTML = renderCamposMina(tipoSelect.value);
    });

    // --- Guardar cambios
    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();

      const tipoMina = tipoSelect.value;
      const extras = {};
      camposDiv.querySelectorAll("input").forEach((input) => {
        extras[input.id] = input.value.trim();
      });

      const updatedData = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        deviceId: document.getElementById("deviceId").value.trim(),
        isAdmin: document.getElementById("isAdmin").value === "true",
        tipoMina,
        ...extras,
        latitude: parseFloat(document.getElementById("techLat").value) || 0,
        longitude: parseFloat(document.getElementById("techLng").value) || 0,
        altitude: parseFloat(document.getElementById("techAlt").value) || 0,
        precision: parseFloat(document.getElementById("techPrecision").value) || 0,
        pais: document.getElementById("geoPais").value.trim(),
        region: document.getElementById("geoRegion").value.trim(),
        comuna: document.getElementById("geoComuna").value.trim(),
        nombreMina: document.getElementById("geoMina").value.trim(),
        nombreEmpresa: document.getElementById("geoEmpresa").value.trim(),
        email: userEmail,
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(userDocRef, updatedData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), updatedData);
        alert("✅ Datos guardados correctamente");
      } catch (err) {
        alert("❌ Error: " + err.message);
      }
    };

    // --- Eliminar usuario
    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Eliminar usuario permanentemente?")) return;
      try {
        await deleteDoc(userDocRef);
        await remove(ref(db, `usuarios/${userId}`));
        alert("🗑️ Usuario eliminado");
        navigate("login");
      } catch (err) {
        alert("❌ Error al eliminar: " + err.message);
      }
    };

    // --- Mostrar dispositivo asignado
    onValue(ref(db, `usuarios/${user.uid}`), (snapshot) => {
      const data = snapshot.val();
      if (data?.deviceId) {
        mostrarDatosDispositivo(data.deviceId, document.getElementById("deviceData"));
      } else {
        document.getElementById("deviceData").innerHTML = "<p>No hay dispositivo asignado.</p>";
      }
    });
  });
}
