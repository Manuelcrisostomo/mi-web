import { db, ref, onValue } from "../firebaseConfig.js";
import { navigate } from "../app.js";

export function showGraficos() {
  const root = document.getElementById("root");
  root.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
    <div class="container-fluid">
      <a class="navbar-brand fw-bold text-warning" href="#">📊 Gráficos</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navGraf"
        aria-controls="navGraf" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navGraf">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><button class="nav-link btn-link" data-view="user">🏠 Inicio</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="devices">💡 Dispositivos</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="usuarios">👥 Usuarios</button></li>
          <li class="nav-item"><button class="nav-link btn-link" data-view="geolocalizacion">📍 Mapa</button></li>
        </ul>
        <div class="d-flex">
          <button id="themeToggle" class="btn btn-warning btn-sm me-2">🌙</button>
          <button class="btn btn-danger btn-sm logout">🚪 Cerrar Sesión</button>
        </div>
      </div>
    </div>
  </nav>

  <div class="container mt-4">
    <h2>📈 Gráficos de Sensores</h2>
    <canvas id="chart" style="max-width:100%; height:300px;"></canvas>
  </div>
  `;

  root.querySelectorAll("button[data-view]").forEach(btn =>
    btn.addEventListener("click", () => navigate(btn.dataset.view))
  );

  // Logout
  document.querySelector(".logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // Tema oscuro
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

  const ctx = document.getElementById("chart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "CO", data: [], borderColor: "#dc3545" },
        { label: "CO₂", data: [], borderColor: "#17a2b8" },
        { label: "PM2.5", data: [], borderColor: "#ffc107" }
      ]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  const deviceRef = ref(db, "dispositivos/device_38A839E81F84");
  onValue(deviceRef, (snap) => {
    const d = snap.val();
    if (!d) return;
    chart.data.labels.push(new Date().toLocaleTimeString());
    chart.data.datasets[0].data.push(d.CO || 0);
    chart.data.datasets[1].data.push(d.CO2 || 0);
    chart.data.datasets[2].data.push(d.PM2_5 || 0);
    chart.update();
  });
}
