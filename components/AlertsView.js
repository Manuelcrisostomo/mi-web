import { db, ref, onValue } from "../firebaseConfig.js";
import { navigate } from "../app.js";

export function showAlerts() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <!-- Barra de navegación superior -->
    <div class="d-flex flex-wrap align-items-center justify-content-center p-2" style="background-color:#002b5b;">
      <h4 class="mb-0 me-4 text-white text-center">Minesafe 2 - Panel de Control</h4>

      <a class="nav-link text-white me-2 mb-1 px-3 py-1" id="navBack" style="background-color:#495057; border-radius:5px;" href="#">⬅️ Volver Atrás</a>
      <a class="nav-link text-white me-2 mb-1 px-3 py-1" id="navDevices" style="background-color:#007bff; border-radius:5px;" href="#">💡 Dispositivos</a>
      <a class="nav-link text-white me-2 mb-1 px-3 py-1" id="navMainMenu" style="background-color:#6c757d; border-radius:5px;" href="#">🏠 Menú Principal</a>
      <a class="nav-link text-white me-2 mb-1 px-3 py-1 active" id="navAlerts" style="background-color:#dc3545; border-radius:5px;" href="#">🚨 Alertas</a>
      <a class="nav-link text-white me-2 mb-1 px-3 py-1" id="navHistory" style="background-color:#ffc107; border-radius:5px;" href="#">📜 Historial</a>
      <a class="nav-link text-white me-2 mb-1 px-3 py-1" id="navPage1" style="background-color:#6f42c1; border-radius:5px;" href="#">📄 Página 1</a>
      <a class="nav-link text-white me-2 mb-1 px-3 py-1" id="navPage2" style="background-color:#20c997; border-radius:5px;" href="#">📄 Página 2</a>

      <button class="btn btn-outline-light ms-2 mb-1" id="navLogout">Cerrar Sesión</button>
    </div>

    <!-- Contenido principal -->
    <div class="dashboard container mt-4 text-center" style="max-width:700px; margin:auto;">
      <h2>🚨 Alertas de Seguridad</h2>
      <div id="alerts" class="my-3"></div>
    </div>
  `;

  // --- Navegación ---
  document.getElementById("navBack").onclick = () => navigate("user");        // ⬅️ Volver atrás
  document.getElementById("navDevices").onclick = () => navigate("devices");  // 💡 Dispositivos
  document.getElementById("navMainMenu").onclick = () => navigate("user");    // 🏠 Menú Principal
  document.getElementById("navAlerts").onclick = () => showAlerts();          // 🚨 Alertas
  document.getElementById("navHistory").onclick = () => navigate("historical");// 📜 Historial
  document.getElementById("navPage1").onclick = () => navigate("page1");      // 📄 Página 1
  document.getElementById("navPage2").onclick = () => navigate("page2");      // 📄 Página 2
  document.getElementById("navLogout").onclick = () => navigate("logout");    // 🚪 Cerrar sesión

  // --- Datos de alertas ---
  const deviceRef = ref(db, "dispositivos/device_38A839E81F84");
  onValue(deviceRef, (snapshot) => {
    const d = snapshot.val();
    const container = document.getElementById("alerts");
    if (!d) {
      container.innerHTML = "<p>No hay datos del dispositivo.</p>";
      return;
    }

    let alerts = [];
    if (d.CO > 50) alerts.push({ tipo: "CO", mensaje: "Nivel peligroso de monóxido de carbono" });
    if (d.CO2 > 1000) alerts.push({ tipo: "CO₂", mensaje: "Concentración alta de dióxido de carbono" });
    if (d.PM10 > 100) alerts.push({ tipo: "PM10", mensaje: "Alta contaminación por partículas PM10" });
    if (d.PM2_5 > 50) alerts.push({ tipo: "PM2.5", mensaje: "Alta contaminación por partículas PM2.5" });
    if (d.humedad > 80) alerts.push({ tipo: "Humedad", mensaje: "Humedad excesiva detectada" });

    if (alerts.length === 0) {
      container.innerHTML = `<div class="alert alert-success">✅ Todos los niveles están dentro del rango seguro.</div>`;
      return;
    }

    container.innerHTML = "";
    alerts.forEach((a) => {
      container.innerHTML += `<div class="alert alert-danger"><b>${a.tipo}</b>: ${a.mensaje}</div>`;
    });
  });
}
