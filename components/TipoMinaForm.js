// ================================================
// TipoMinaForm.js — Tipo de mina + localización + geolocalización GPS
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
      <h2>⛏️ Tipo de Mina y Localización</h2>
      <form id="minaForm" class="card p-3 shadow-sm">

        <!-- Tipo de mina -->
        <label><strong>Tipo de mina:</strong></label>
        <select id="tipoMina" class="form-select mb-3">
          <option value="">Seleccione...</option>
          <option value="subterranea">⛏️ Subterránea</option>
          <option value="tajo_abierto">🪨 Tajo Abierto</option>
          <option value="aluvial">💧 Aluvial</option>
          <option value="cantera">🏗️ Cantera</option>
          <option value="pirquen">🧰 Pirquén / Artesanal</option>
        </select>

        <!-- Localización general -->
        <h5 class="mt-3">📍 Localización general</h5>
        <input id="pais" class="form-control mb-2" placeholder="País" />
        <input id="region" class="form-control mb-2" placeholder="Región / Estado" />
        <input id="comuna" class="form-control mb-2" placeholder="Comuna / Municipio" />
        <input id="localidad" class="form-control mb-2" placeholder="Localidad o referencia cercana" />
        <input id="direccion" class="form-control mb-2" placeholder="Dirección o ruta de acceso (opcional)" />

        <!-- Geolocalización -->
        <h5 class="mt-3">🌎 Geolocalización</h5>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <button type="button" id="getLocationBtn" class="btn btn-outline-primary btn-sm">📡 Obtener ubicación actual</button>
        </div>
        <input id="latitud" type="number" step="any" class="form-control mb-2" placeholder="Latitud (ej: -22.287)" />
        <input id="longitud" type="number" step="any" class="form-control mb-2" placeholder="Longitud (ej: -68.933)" />
        <input id="utmZona" class="form-control mb-2" placeholder="Zona UTM (ej: 19K)" />
        <input id="utmEste" type="number" step="any" class="form-control mb-2" placeholder="UTM Este (m)" />
        <input id="utmNorte" type="number" step="any" class="form-control mb-2" placeholder="UTM Norte (m)" />
        <input id="altitud" type="number" step="any" class="form-control mb-2" placeholder="Altitud (m s.n.m.)" />
        <input id="referencia" class="form-control mb-2" placeholder="Referencia o punto notable" />

        <!-- Campos específicos por tipo -->
        <div id="camposExtras" class="mt-3"></div>

        <button class="btn btn-success w-100 mt-3">💾 Guardar</button>
        <button type="button" id="backBtn" class="btn btn-secondary w-100 mt-2">⬅️ Volver</button>
      </form>
    </div>
  `;

  const extras = document.getElementById("camposExtras");
  const tipoMina = document.getElementById("tipoMina");
  const backBtn = document.getElementById("backBtn");
  const getLocationBtn = document.getElementById("getLocationBtn");

  // Plantillas según tipo de mina
  const plantillas = {
    subterranea: `
      <h5>🔩 Datos subterráneos</h5>
      <input id="nivel" class="form-control mb-2" placeholder="Nivel o piso" />
      <input id="galeria" class="form-control mb-2" placeholder="Galería / rampa" />
      <input id="frente" class="form-control mb-2" placeholder="Frente o cámara" />
    `,
    tajo_abierto: `
      <h5>🏞️ Datos de tajo abierto</h5>
      <input id="tajo" class="form-control mb-2" placeholder="Tajo o sector" />
      <input id="banco" class="form-control mb-2" placeholder="Banco o nivel de extracción" />
      <input id="frente" class="form-control mb-2" placeholder="Frente activo" />
    `,
    aluvial: `
      <h5>💧 Datos aluviales</h5>
      <input id="rio" class="form-control mb-2" placeholder="Río o quebrada" />
      <input id="tramo" class="form-control mb-2" placeholder="Tramo o referencia (km)" />
      <input id="poza" class="form-control mb-2" placeholder="Poza o frente de trabajo" />
    `,
    cantera: `
      <h5>🏗️ Datos de cantera</h5>
      <input id="material" class="form-control mb-2" placeholder="Material extraído" />
      <input id="banco" class="form-control mb-2" placeholder="Banco o zona" />
      <input id="frente" class="form-control mb-2" placeholder="Frente activo" />
    `,
    pirquen: `
      <h5>⚒️ Datos de pirquén</h5>
      <input id="faena" class="form-control mb-2" placeholder="Nombre del pirquén o faena" />
      <input id="nivel" class="form-control mb-2" placeholder="Nivel o galería principal" />
      <input id="frente" class="form-control mb-2" placeholder="Frente de trabajo" />
    `
  };

  function render(tipo) {
    extras.innerHTML = plantillas[tipo] || "";
  }

  tipoMina.onchange = (e) => render(e.target.value);
  backBtn.onclick = () => navigate("user");

  // === 📡 Botón para obtener la ubicación actual ===
  getLocationBtn.onclick = () => {
    if (!navigator.geolocation) {
      alert("❌ Tu navegador no soporta geolocalización.");
      return;
    }
    getLocationBtn.disabled = true;
    getLocationBtn.textContent = "Obteniendo ubicación...";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const alt = pos.coords.altitude || null;

        document.getElementById("latitud").value = lat.toFixed(6);
        document.getElementById("longitud").value = lon.toFixed(6);
        if (alt !== null) document.getElementById("altitud").value = alt.toFixed(2);

        getLocationBtn.textContent = "📡 Obtener ubicación actual";
        getLocationBtn.disabled = false;
        alert("✅ Ubicación obtenida correctamente.");
      },
      (err) => {
        alert("⚠️ No se pudo obtener la ubicación: " + err.message);
        getLocationBtn.textContent = "📡 Obtener ubicación actual";
        getLocationBtn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // === Guardado de datos ===
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

      const localizacion = {
        pais: pais.value,
        region: region.value,
        comuna: comuna.value,
        localidad: localidad.value,
        direccion: direccion.value,
        coordenadas: {
          latitud: parseFloat(latitud.value) || null,
          longitud: parseFloat(longitud.value) || null,
          utm: {
            zona: utmZona.value,
            este: parseFloat(utmEste.value) || null,
            norte: parseFloat(utmNorte.value) || null
          },
          altitud: parseFloat(altitud.value) || null
        },
        referencia: referencia.value,
        fechaRegistro: new Date().toISOString()
      };

      const detalle = {};
      extras.querySelectorAll("input").forEach((i) => (detalle[i.id] = i.value));

      const dataGuardar = {
        tipoMina: tipo,
        localizacion,
        detalle
      };

      await setDoc(refDoc, dataGuardar, { merge: true });
      await update(ref(db, `usuarios/${user.uid}`), dataGuardar);

      alert("✅ Tipo de mina y localización guardados correctamente");
    };
  });
}
