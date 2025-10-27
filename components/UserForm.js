// /components/UserForm.js
import { auth, firestore, db, ref, onAuthStateChanged } from "../firebaseConfig.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";

export function showUserForm() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Formulario de Usuario</h2>
      <form id="userFormCard" class="card">
        <label>Nombre:</label>
        <input type="text" id="nombre" placeholder="Nombre completo" />

        <label>Teléfono:</label>
        <input type="text" id="telefono" placeholder="Teléfono" />

        <label>Dirección:</label>
        <input type="text" id="direccion" placeholder="Dirección" />

        <label>ID del Dispositivo:</label>
        <input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" />

        <label>Rol:</label>
        <select id="isAdmin">
          <option value="false">Usuario Normal</option>
          <option value="true">Administrador</option>
        </select>

        <button type="submit">💾 Guardar Cambios</button>
      </form>
      <button id="backBtn">⬅️ Volver al Panel</button>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => navigate("user");

  // Cargar datos del usuario actual
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");
    const docRef = doc(firestore, "users", user.uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("telefono").value = data.telefono || "";
      document.getElementById("direccion").value = data.direccion || "";
      document.getElementById("deviceId").value = data.deviceId || "";
      document.getElementById("isAdmin").value = data.isAdmin ? "true" : "false";
    }
  });

  // Guardar cambios
  document.getElementById("userFormCard").onsubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("⚠️ No hay usuario activo.");

    const updated = {
      nombre: document.getElementById("nombre").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      direccion: document.getElementById("direccion").value.trim(),
      deviceId: document.getElementById("deviceId").value.trim(),
      isAdmin: document.getElementById("isAdmin").value === "true",
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(firestore, "users", user.uid), updated, { merge: true });
      await update(ref(db, `usuarios/${user.uid}`), updated);
      alert("✅ Datos actualizados correctamente.");
    } catch (err) {
      alert("❌ Error al guardar: " + err.message);
    }
  };
}
