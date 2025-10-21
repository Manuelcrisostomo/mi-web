import { auth } from "../firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { navigate } from "../app.js";

export function showLogin() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="card">
      <h2>Iniciar Sesión</h2>
      <input id="email" placeholder="Correo" type="email" />
      <input id="password" placeholder="Contraseña" type="password" />
      <button id="btnLogin">Entrar</button>
      <p>¿No tienes cuenta? <a id="goRegister">Regístrate</a></p>
    </div>
  `;

  document.getElementById("goRegister").onclick = () => navigate("register");
  document.getElementById("btnLogin").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (email === "admin@minesafe.com") navigate("admin");
      else navigate("user");
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };
}
