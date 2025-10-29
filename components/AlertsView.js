// ================================================
// AlertsView.js — Panel de alertas con barra moderna
// ================================================
import { db, ref, onValue } from "../firebaseConfig.js";
import { navigate } from "../app.js";

export function showAlerts() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <!-- NAVBAR MODERNA -->
    <nav class="main-navbar">
      <button data-view="user">🏠 Menú Principal</button>
      <button data-view="devices" style="background-color:#007bff;">💡 Dispositivos</button>
      <button data-view="alerts" style="background-color:#dc3545;">🚨 Alertas</button>
      <button data-view="history" style="background-color:#ffc107;">📜 Historial</button>
      <button data-view="pagina1" style="background-color:#6f42c1;">📄 Página 1</button>
      <button data-view="pagina2" style="background-color:#20c997;">📄 Página 2</button>
      <button data-view="usuarios" style="background-color:#495057;">👥 Usuarios</button>
      <button data-view="graficos" style="background-color:#17a2b8;">📊 Gráficos</button>
      <button data-view="geolocalizacion" style="background-color:#28a745;">📍 Mapa</button>
      <button class="logout" style="background-color:#6c757d;">🚪 Cerrar Sesión</button>
    </nav>

    <!-- CONTENIDO -->
    <div class="dashboard">
      <h2>🚨 Alertas de Seguridad</h2>
      <div id="alerts" class="card text-center">Cargando alertas...</div>
    </div>
  `;

  // --- Navegación ---
  root.querySelectorAll(".main-navbar button[data-view]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.view));
  });

  root.querySelector(".logout").onclick = () => navigate("login");

  // --- Datos de alertas ---
  const deviceRef = ref(db, "dispositivos/device_38A839E81F84");
  onValue(deviceRef, (snapshot) => {
    const d = snapshot.val();
    const container = document.getElementById("alerts");

    if (!d) {
      container.innerHTML = "<p>No hay datos del dispositivo.</p>";
      return;
    }

    const alerts = [];
    if (d.CO > 50) alerts.push({ tipo: "CO", msg: "Nivel peligroso de monóxido de carbono" });
    if (d.CO2 > 1000) alerts.push({ tipo: "CO₂", msg: "Concentración alta de dióxido de carbono" });
    if (d.PM10 > 100) alerts.push({ tipo: "PM10", msg: "Alta contaminación por partículas PM10" });
    if (d.PM2_5 > 50) alerts.push({ tipo: "PM2.5", msg: "Alta contaminación por partículas PM2.5" });
    if (d.humedad > 80) alerts.push({ tipo: "Humedad", msg: "Humedad excesiva detectada" });

    container.innerHTML =
      alerts.length === 0
        ? `<div class="alert alert-success">✅ Todos los niveles están dentro del rango seguro.</div>`
        : alerts.map(a => `<div class="alert alert-danger"><b>${a.tipo}</b>: ${a.msg}</div>`).join("");
  });
}
