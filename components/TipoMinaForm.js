// /components/TipoMinaForm.js
import { auth, firestore, db, ref, onAuthStateChanged } from "../firebaseConfig.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";

export function showTipoMinaForm() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Formulario Tipo de Mina</h2>
      <form id="minaFormCard" class="card">
        <h4>Tipo de Mina</h4>
        <select id="tipoMina">
          <option value="">Seleccione tipo...</option>
          <option value="subterranea">⛏️ Subterránea</option>
          <option value="tajo_abierto">🪨 Tajo Abierto</option>
          <option value="aluvial">💧 Aluvial</option>
          <option value="cantera">🏗️ Cantera</option>
          <option value="pirquen">🧰 Pirquén / Artesanal</option>
        </select>
        <div id="camposMina"></div>

        <button type="submit">💾 Guardar Cambios</button>
      </form>
      <button id="backBtn">⬅️ Volver al Panel</button>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => navigate("user");

  const tipoSelect = document.getElementById("tipoMina");
  const camposDiv = document.getElementById("camposMina");

  tipoSelect.addEventListener("change", (e) => {
    camposDiv.innerHTML = renderCamposMina(e.target.value);
  });

  // Cargar datos existentes
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const docRef = doc(firestore, "users", user.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      tipoSelect.value = data.tipoMina || "";
      camposDiv.innerHTML = renderCamposMina(tipoSelect.value);
    }
  });

  // Guardar cambios
  document.getElementById("minaFormCard").onsubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("⚠️ No hay usuario activo.");

    const tipo = tipoSelect.value;
    const extras = {};
    camposDiv.querySelectorAll("input").forEach((i) => (extras[i.id] = i.value.trim()));

    const updated = { tipoMina: tipo, ...extras, updatedAt: new Date().toISOString() };

    try {
      await setDoc(doc(firestore, "users", user.uid), updated, { merge: true });
      await update(ref(db, `usuarios/${user.uid}`), updated);
      alert("✅ Tipo de mina actualizado correctamente.");
    } catch (err) {
      alert("❌ Error al guardar: " + err.message);
    }
  };
}

function renderCamposMina(tipo) {
  switch (tipo) {
    case "subterranea":
      return `
        <h4>⛏️ Subterránea</h4>
        <label>Zona:</label><input id="zona" />
        <label>Rampa:</label><input id="rampa" />
        <label>Galería:</label><input id="galeria" />
      `;
    case "tajo_abierto":
      return `
        <h4>🪨 Tajo Abierto</h4>
        <label>Banco:</label><input id="banco" />
        <label>Fase:</label><input id="fase" />
      `;
    case "aluvial":
      return `
        <h4>💧 Aluvial</h4>
        <label>Río:</label><input id="rio" />
        <label>Tramo:</label><input id="tramo" />
      `;
    case "cantera":
      return `
        <h4>🏗️ Cantera</h4>
        <label>Material:</label><input id="material" />
      `;
    case "pirquen":
      return `
        <h4>🧰 Pirquén</h4>
        <label>Faena:</label><input id="faena" />
        <label>Tipo de explotación:</label><input id="tipoExplotacion" />
      `;
    default:
      return "";
  }
}
