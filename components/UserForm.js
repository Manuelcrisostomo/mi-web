// ================================================ 
// UserForm.js — Datos personales del usuario (sin opción de rol) adaptado a modo oscuro
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
        <p id="rolText" class="fw-bold mb-3"></p>
        <button class="btn btn-success w-100 mb-2">💾 Guardar</button>
        <button type="button" id="backBtn" class="btn btn-secondary w-100">⬅️ Volver</button>
      </form>
    </div>
  `;

  const rolText = document.getElementById("rolText");
  const backBtn = document.getElementById("backBtn");
  const userForm = document.getElementById("userForm");

  backBtn.onclick = () => navigate("user");

  onAuthStateChanged(auth, (user) => {
    if (!user) return navigate("login");
    const userRef = doc(firestore, "users", user.uid);

    onSnapshot(userRef, (snap) => {
      const data = snap.data() || {};
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("telefono").value = data.telefono || "";
      document.getElementById("direccion").value = data.direccion || "";

      // Mostrar rol como texto visible
      const rol = data.isAdmin ? "Administrador" : "Usuario";
      rolText.textContent = `Usted es usuario con rol: ${rol}`;

      // Color dinámico según modo
      rolText.style.color = document.body.classList.contains("dark-mode") ? "#fff" : "#111";
    });

    userForm.onsubmit = async (e) => {
      e.preventDefault();
      const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        isAdmin: rolText.textContent.includes("Administrador")
      };
      await setDoc(userRef, datos, { merge: true });
      await update(ref(db, `usuarios/${user.uid}`), datos);
      alert("✅ Datos personales guardados correctamente");
    };
  });
}
