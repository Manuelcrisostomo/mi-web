// ================================================
// GeoEmpresaForm.js — Datos geográficos y de empresa
// ================================================
import { auth, db, firestore } from "../firebaseConfig.js";
import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { navigate } from "../app.js";

export function showGeoEmpresaForm() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="container mt-4">
      <h2>🌍 Datos Geográficos / Empresa</h2>
      <form id="geoForm" class="card p-3 shadow-sm">
        <label>País:</label><input id="pais" class="form-control mb-2" />
        <label>Región:</label><input id="region" class="form-control mb-2" />
        <label>Comuna:</label><input id="comuna" class="form-control mb-2" />
        <label>Nombre de la mina:</label><input id="mina" class="form-control mb-2" />
        <label>Empresa:</label><input id="empresa" class="form-control mb-3" />
        <button class="btn btn-success w-100 mb-2">Guardar</button>
        <button type="button" id="backBtn" class="btn btn-secondary w-100">⬅️ Volver</button>
      </form>
    </div>
  `;

  backBtn.onclick = () => navigate("user");

  onAuthStateChanged(auth, (user) => {
    if (!user) return navigate("login");
    const refDoc = doc(firestore, "users", user.uid);

    onSnapshot(refDoc, (snap) => {
      const d = snap.data() || {};
      pais.value = d.pais || "";
      region.value = d.region || "";
      comuna.value = d.comuna || "";
      mina.value = d.nombreMina || "";
      empresa.value = d.nombreEmpresa || "";
    });

    geoForm.onsubmit = async (e) => {
      e.preventDefault();
      const datos = {
        pais: pais.value.trim(),
        region: region.value.trim(),
        comuna: comuna.value.trim(),
        nombreMina: mina.value.trim(),
        nombreEmpresa: empresa.value.trim()
      };
      await setDoc(refDoc, datos, { merge: true });
      await update(ref(db, `usuarios/${user.uid}`), datos);
      alert("✅ Datos geográficos guardados correctamente");
    };
  });
}
