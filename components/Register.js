import { auth } from "../firebaseConfig.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { navigate } from "../app.js";

export function showRegister() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="card">
      <h2>Registro</h2>
      <input id="email" placeholder="Correo" type="email" />
      <input id="password" placeholder="Contraseña" type="password" />
      <button id="btnRegister">Registrar</button>
      <p>¿Ya tienes cuenta? <a id="goLogin">Inicia sesión</a></p>
    </div>
  `;

  document.getElementById("goLogin").onclick = () => navigate("login");
  document.getElementById("btnRegister").onclick = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email.value, password.value);
      alert("Usuario registrado correctamente");
      navigate("login");
    } catch (error) {
      alert("Error al registrar: " + error.message);
    }
  };
}
