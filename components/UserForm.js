// ================================================
// UserForm.js — Datos personales del usuario
// ================================================
import { auth, db, firestore } from "../firebaseConfig.js";
import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { navigate } from "../app.js";

export function showUserForm() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="container mt-4">
      <h2>👤 Datos del Usuario</h2>
      <form id="userForm" class="card p-3 shadow-sm">
        <label>Nombre:</label>
        <input id="nombre" class="form-control mb-2" placeholder="Nombre completo" />
        <label>Teléfono:</label>
        <input id="telefono" class="form-control mb-2" placeholder="Teléfono" />
        <label>Dirección:</label>
        <input id="direccion" class="form-control mb-2" placeholder="Dirección" />
        <label>Rol:</label>
        <select id="isAdmin" class="form-select mb-3">
          <option value="false">Usuario Normal</option>
          <option value="true">Administrador</option>
        </select>
        <button class="btn btn-success w-100 mb-2">💾 Guardar</button>
        <button type="button" id="backBtn" class="btn btn-secondary w-100">⬅️ Volver</button>
      </form>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => navigate("user");

  onAuthStateChanged(auth, (user) => {
    if (!user) return navigate("login");
    const userRef = doc(firestore, "users", user.uid);

    onSnapshot(userRef, (snap) => {
      const data = snap.data() || {};
      nombre.value = data.nombre || "";
      telefono.value = data.telefono || "";
      direccion.value = data.direccion || "";
      isAdmin.value = data.isAdmin ? "true" : "false";
    });

    userForm.onsubmit = async (e) => {
      e.preventDefault();
      const datos = {
        nombre: nombre.value.trim(),
        telefono: telefono.value.trim(),
        direccion: direccion.value.trim(),
        isAdmin: isAdmin.value === "true"
      };
      await setDoc(userRef, datos, { merge: true });
      await update(ref(db, `usuarios/${user.uid}`), datos);
      alert("✅ Datos personales guardados correctamente");
    };
  });
}
