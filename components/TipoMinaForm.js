// ================================================
// TipoMinaForm.js — Tipo de mina y campos adicionales
// ================================================
import { auth, db, firestore } from "../firebaseConfig.js";
import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { navigate } from "../app.js";

export function showTipoMinaForm() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="container mt-4">
      <h2>⛏️ Tipo de Mina</h2>
      <form id="minaForm" class="card p-3 shadow-sm">
        <label>Seleccionar tipo:</label>
        <select id="tipoMina" class="form-select mb-3">
          <option value="">Seleccione...</option>
          <option value="subterranea">⛏️ Subterránea</option>
          <option value="tajo_abierto">🪨 Tajo Abierto</option>
          <option value="aluvial">💧 Aluvial</option>
          <option value="cantera">🏗️ Cantera</option>
          <option value="pirquen">🧰 Pirquén / Artesanal</option>
        </select>
        <div id="camposExtras"></div>
        <button class="btn btn-success w-100 mb-2">Guardar</button>
        <button type="button" id="backBtn" class="btn btn-secondary w-100">⬅️ Volver</button>
      </form>
    </div>
  `;

  const extras = document.getElementById("camposExtras");

  const plantillas = {
    subterranea: `
      <input id="zona" class="form-control mb-2" placeholder="Zona" />
      <input id="rampa" class="form-control mb-2" placeholder="Rampa" />
      <input id="galeria" class="form-control mb-2" placeholder="Galería" />
    `,
    tajo_abierto: `
      <input id="banco" class="form-control mb-2" placeholder="Banco" />
      <input id="fase" class="form-control mb-2" placeholder="Fase" />
    `,
    aluvial: `
      <input id="rio" class="form-control mb-2" placeholder="Río" />
      <input id="tramo" class="form-control mb-2" placeholder="Tramo" />
    `,
    cantera: `
      <input id="material" class="form-control mb-2" placeholder="Material" />
      <input id="frente" class="form-control mb-2" placeholder="Frente" />
    `,
    pirquen: `
      <input id="faena" class="form-control mb-2" placeholder="Faena" />
      <input id="nivel" class="form-control mb-2" placeholder="Nivel" />
    `
  };

  function render(tipo) {
    extras.innerHTML = plantillas[tipo] || "";
  }

  tipoMina.onchange = (e) => render(e.target.value);
  backBtn.onclick = () => navigate("user");

  onAuthStateChanged(auth, (user) => {
    if (!user) return navigate("login");
    const refDoc = doc(firestore, "users", user.uid);

    onSnapshot(refDoc, (snap) => {
      const data = snap.data() || {};
      tipoMina.value = data.tipoMina || "";
      render(data.tipoMina);
    });

    minaForm.onsubmit = async (e) => {
      e.preventDefault();
      const tipo = tipoMina.value;
      const extra = {};
      extras.querySelectorAll("input").forEach((i) => (extra[i.id] = i.value));
      await setDoc(refDoc, { tipoMina: tipo, ...extra }, { merge: true });
      await update(ref(db, `usuarios/${user.uid}`), { tipoMina: tipo, ...extra });
      alert("✅ Tipo de mina guardado correctamente");
    };
  });
}
