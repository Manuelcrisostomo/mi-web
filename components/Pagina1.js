import { navigate } from "../app.js"; // Asegúrate de importar navigate

export function showPagina1() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Página 1</h2>
      <p>Ingresa texto aquí</p>
      <button id="volverBtn">Volver</button>
    </div>
  `;

  // Botón volver usando navigate
  document.getElementById("volverBtn").onclick = () => navigate("devices");
}
