// ================================================
// AlertsView.js — Panel de alertas con navbar Bootstrap + modo oscuro/claro
// ================================================
import { db, ref, onValue } from "../firebaseConfig.js";
import { navigate } from "../app.js";

export function showAlerts() {
  const root = document.getElementById("root");

  root.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-warning" href="#">⚙️ Minesafe 2</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavAlerts"
        aria-controls="mainNavAlerts" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNavAlerts">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><button class="nav-link btn-link" data-view="user">🏠 Menú Principal</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="devices">💡 Dispositivos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="alerts">🚨 Alertas</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="history">📜 Historial</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="pagina1">📄 Página 1</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="pagina2">📄 Página 2</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="usuarios">👥 Usuarios</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="graficos">📊 Gráficos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="geolocalizacion">📍 Mapa</button></li>
        </ul>
        <div class="d-flex">
          <button id="themeToggle" class="btn btn-warning btn-sm me-2">🌙</button>
          <button class="btn btn-danger btn-sm logout">🔒 Cerrar Sesión</button>
        </div>
      </div>
    </div>
  </nav>

  <div class="container py-3">
    <div class="dashboard">
      <h2 class="fw-bold">🚨 Alertas de Seguridad</h2>
      <div id="alerts" class="card text-center p-3">Cargando alertas...</div>
    </div>
  </div>
  `;

  // ==================== NAVBAR NAVIGATION ====================
  document.querySelectorAll("button[data-view]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.view));
  });

  // Logout
  document.querySelector(".logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // Tema oscuro/claro
  const themeBtn = document.getElementById("themeToggle");
  themeBtn.onclick = () => {
    document.body.classList.toggle("dark-mode");
    themeBtn.textContent = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
  };
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.textContent = "🌞";
  }

  // ==================== Datos de alertas ====================
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
