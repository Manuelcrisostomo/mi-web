// ================================================ 
// UserForm.js — Datos personales del usuario con adaptación completa a modo oscuro
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
  const nombreInput = document.getElementById("nombre");
  const telefonoInput = document.getElementById("telefono");
  const direccionInput = document.getElementById("direccion");
  const labels = userForm.querySelectorAll("label");

  // Función para actualizar colores según modo
  function actualizarColores() {
    const dark = document.body.classList.contains("dark-mode");
    const textColor = dark ? "#fff" : "#111";
    const bgColor = dark ? "#333" : "#fff";

    // Labels y rol
    labels.forEach(label => label.style.color = textColor);
    rolText.style.color = textColor;

    // Inputs
    [nombreInput, telefonoInput, direccionInput].forEach(input => {
      input.style.color = textColor;
      input.style.backgroundColor = bgColor;
      input.style.borderColor = dark ? "#555" : "#ccc";
      input.style.caretColor = textColor;
    });
  }

  // Inicializar colores
  actualizarColores();

  backBtn.onclick = () => navigate("user");

  onAuthStateChanged(auth, (user) => {
    if (!user) return navigate("login");
    const userRef = doc(firestore, "users", user.uid);

    onSnapshot(userRef, (snap) => {
      const data = snap.data() || {};
      nombreInput.value = data.nombre || "";
      telefonoInput.value = data.telefono || "";
      direccionInput.value = data.direccion || "";

      // Mostrar rol como texto
      const rol = data.isAdmin ? "Administrador" : "Usuario";
      rolText.textContent = `Usted es usuario con rol: ${rol}`;
    });

    userForm.onsubmit = async (e) => {
      e.preventDefault();
      const datos = {
        nombre: nombreInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        direccion: direccionInput.value.trim(),
        isAdmin: rolText.textContent.includes("Administrador")
      };
      await setDoc(userRef, datos, { merge: true });
      await update(ref(db, `usuarios/${user.uid}`), datos);
      alert("✅ Datos personales guardados correctamente");
    };
  });

  // Detectar cambios de tema (si aplicas toggle dinámico)
  const observer = new MutationObserver(actualizarColores);
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}
