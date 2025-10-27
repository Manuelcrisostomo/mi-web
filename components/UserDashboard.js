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
import { mostrarDatosDispositivo } from "./DeviceAssigned.js";

export function showUserDashboard() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Panel de Usuario</h2>
      <div id="userProfile" class="card"></div>
      <div class="actions">
        <button id="goUserForm">🧍 Datos de Usuario</button>
        <button id="goTipoMina">⛏️ Tipo de Mina</button>
        <button id="goDeviceAssigned">📟 Dispositivo</button>
        <button id="devicesBtn">Ver Dispositivos</button>
        <button id="logout">Cerrar Sesión</button>
      </div>
    </div>
  `;

  // Navegación entre vistas
  document.getElementById("goUserForm").onclick = () => navigate("userform");
  document.getElementById("goTipoMina").onclick = () => navigate("tipomina");
  document.getElementById("goDeviceAssigned").onclick = () => navigate("deviceassigned");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // Mostrar info del usuario autenticado
  onAuthStateChanged(auth, (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");

    const userDocRef = doc(firestore, "users", user.uid);
    onSnapshot(userDocRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Rol:</b> ${data.isAdmin ? "Administrador" : "Usuario"}</p>
        <p><b>Tipo Mina:</b> ${data.tipoMina || "-"}</p>
        <p><b>Dispositivo:</b> ${data.deviceId || "-"}</p>
      `;
    });
  });
}
