//agrega el nav // ================================================
// userDashboard.js — Gestión de Usuario y Tipos de Mina
// ================================================

import {
  auth,
  db,
  firestore,
  ref,
  onValue,
  remove,
  get,
  onAuthStateChanged
} from "../firebaseConfig.js";

import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";

export function showUserDashboard() {
  const root = document.getElementById("root");

  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card"></div>

      <h3>Editar Datos del Usuario</h3>
      <form id="editForm" class="card">

        <h4>Datos Personales</h4>
        <label>Nombre:</label><input type="text" id="nombre" placeholder="Nombre completo" />
        <label>Teléfono:</label><input type="text" id="telefono" placeholder="Teléfono" />
        <label>Dirección:</label><input type="text" id="direccion" placeholder="Dirección" />
        <label>ID del Dispositivo:</label><input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" />

        <h4>Tipo de Mina</h4>
        <select id="tipoMina">
          <option value="">Seleccione tipo...</option>
          <option value="subterranea">⛏️ Subterránea</option>
          <option value="tajo_abierto">🪨 Tajo Abierto</option>
          <option value="aluvial">💧 Aluvial (placer)</option>
          <option value="cantera">🏗️ Cantera</option>
          <option value="pirquen">🧰 Pirquén / Artesanal</option>
        </select>

        <div id="camposMina"></div>

        <h4>Datos Técnicos (Mapas/Sistema)</h4>
        <label>Latitud:</label><input type="number" step="0.000001" id="techLat" placeholder="Latitud" />
        <label>Longitud:</label><input type="number" step="0.000001" id="techLng" placeholder="Longitud" />
        <label>Altitud (m):</label><input type="number" step="0.1" id="techAlt" placeholder="Altitud" />
        <label>Precisión (m):</label><input type="number" step="0.01" id="techPrecision" placeholder="Precisión" />
        <label>EPSG/WGS84:</label><input type="text" id="techEPSG" placeholder="EPSG/WGS84" />

        <h4>Datos Geográficos / Empresariales</h4>
        <label>País:</label><input type="text" id="geoPais" placeholder="País" />
        <label>Región:</label><input type="text" id="geoRegion" placeholder="Región" />
        <label>Comuna:</label><input type="text" id="geoComuna" placeholder="Comuna" />
        <label>Nombre de la mina:</label><input type="text" id="geoMina" placeholder="Nombre de la mina" />
        <label>Nombre de la empresa:</label><input type="text" id="geoEmpresa" placeholder="Nombre de la empresa" />

        <button type="submit">💾 Guardar Cambios</button>
        <button type="button" id="deleteUser" class="delete-btn">🗑️ Borrar Usuario</button>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card">Cargando dispositivo...</div>

      <div class="actions">
        <button id="alertsBtn">Ver Alertas</button>
        <button id="devicesBtn">Ver Dispositivos</button>
        <button id="logout">Cerrar Sesión</button>
      </div>
    </div>
  `;

  // --- Navegación
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("logout").onclick = async () => { await auth.signOut(); navigate("login"); };

  // --- Renderizado dinámico de campos según tipo de mina
  const camposMinaDiv = document.getElementById("camposMina");
  const tipoSelect = document.getElementById("tipoMina");

  function renderCampos(tipo) {
    let html = "";
    switch (tipo) {
      case "subterranea":
        html = `
          <h4>⛏️ Subterránea</h4>
          <label>Zona:</label><input id="zona" placeholder="Zona" />
          <label>Rampa:</label><input id="rampa" placeholder="Rampa" />
          <label>Galería:</label><input id="galeria" placeholder="Galería" />
          <label>Sector:</label><input id="sector" placeholder="Sector" />
          <label>Nombre de estación:</label><input id="nombreEstacion" placeholder="Nombre estación" />
        `;
        break;
      case "tajo_abierto":
        html = `
          <h4>🪨 Tajo Abierto</h4>
          <label>Banco:</label><input id="banco" placeholder="Banco" />
          <label>Fase:</label><input id="fase" placeholder="Fase" />
          <label>Frente:</label><input id="frente" placeholder="Frente" />
          <label>Coordenadas GPS:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
        `;
        break;
      case "aluvial":
        html = `
          <h4>💧 Aluvial (placer)</h4>
          <label>Mina:</label><input id="mina" placeholder="Mina" />
          <label>Río:</label><input id="rio" placeholder="Río" />
          <label>Tramo:</label><input id="tramo" placeholder="Tramo" />
          <label>Cuadrante:</label><input id="cuadrante" placeholder="Cuadrante" />
          <label>Coordenadas GPS:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
        `;
        break;
      case "cantera":
        html = `
          <h4>🏗️ Cantera</h4>
          <label>Cantera:</label><input id="cantera" placeholder="Cantera" />
          <label>Material:</label><input id="material" placeholder="Material" />
          <label>Frente:</label><input id="frente" placeholder="Frente" />
          <label>Coordenadas GPS:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
          <label>Polígono:</label><input id="poligono" placeholder="Polígono" />
        `;
        break;
      case "pirquen":
        html = `
          <h4>🧰 Pirquén / Artesanal</h4>
          <label>Faena:</label><input id="faena" placeholder="Faena" />
          <label>Tipo de explotación:</label><input id="tipoExplotacion" placeholder="Tipo de explotación" />
          <label>Sector:</label><input id="sector" placeholder="Sector" />
          <label>Coordenadas:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
          <label>Nivel (si aplica):</label><input id="nivel" placeholder="Nivel" />
        `;
        break;
      default:
        html = "";
    }
    camposMinaDiv.innerHTML = html;
  }

  tipoSelect.addEventListener("change", (e) => renderCampos(e.target.value));

  // --- Autenticación y carga de datos
  onAuthStateChanged(auth, async (user) => {
    if (!user) return root.innerHTML = "<p>No hay usuario autenticado.</p>";

    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore, "users", userId);

    onSnapshot(userDocRef, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Email:</b> ${userEmail}</p>
        <p><b>Rol:</b> ${data.isAdmin ? "Administrador" : "Usuario"}</p>
        <p><b>Tipo de mina:</b> ${data.tipoMina || "-"}</p>
      `;

      tipoSelect.value = data.tipoMina || "";
      renderCampos(tipoSelect.value);

      // Cargar dispositivo automáticamente si existe
      if (data.deviceId) mostrarDatosDispositivo(data.deviceId, data);
    });

    // --- Guardar datos (sin permitir cambiar rol)
    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();

      const tipoMina = tipoSelect.value;
      const camposExtras = {};
      camposMinaDiv.querySelectorAll("input").forEach(input => {
        camposExtras[input.id] = input.value.trim();
      });

      const updatedData = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        deviceId: document.getElementById("deviceId").value.trim(),
        // --- Mantener rol actual
        // isAdmin: se mantiene igual en Firestore
        tipoMina,
        ...camposExtras,
        latitude: parseFloat(document.getElementById("techLat").value) || 0,
        longitude: parseFloat(document.getElementById("techLng").value) || 0,
        altitude: parseFloat(document.getElementById("techAlt").value) || 0,
        precision: parseFloat(document.getElementById("techPrecision").value) || 0,
        EPSG: document.getElementById("techEPSG").value.trim() || "WGS84",
        pais: document.getElementById("geoPais").value.trim(),
        region: document.getElementById("geoRegion").value.trim(),
        comuna: document.getElementById("geoComuna").value.trim(),
        nombreMina: document.getElementById("geoMina").value.trim(),
        nombreEmpresa: document.getElementById("geoEmpresa").value.trim(),
        email: userEmail,
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(userDocRef, updatedData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), updatedData);
        alert("✅ Datos guardados correctamente");
      } catch (err) {
        alert("❌ Error al guardar: " + err.message);
      }
    };

    // --- Eliminar usuario
    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Eliminar usuario permanentemente?")) return;
      try {
        await deleteDoc(userDocRef);
        await remove(ref(db, `usuarios/${userId}`));
        alert("🗑️ Usuario eliminado");
        navigate("login");
      } catch (err) {
        alert("❌ Error al eliminar: " + err.message);
      }
    };

    // --- Mostrar datos de dispositivo
    function mostrarDatosDispositivo(deviceId, userData = {}) {
      const deviceRef = ref(db, `dispositivos/${deviceId}`);
      onValue(deviceRef, (snap) => {
        const d = snap.val() || {};
        document.getElementById("deviceData").innerHTML = `
          <h4>Dispositivo: ${deviceId}</h4>
          <p><b>Nombre:</b> ${d.name || "Desconocido"}</p>
          <p><b>Usuario:</b> ${d.userEmail || userData.email || "Sin asignar"}</p>
          <p><b>Latitud:</b> ${d.latitude ?? 0}</p>
          <p><b>Longitud:</b> ${d.longitude ?? 0}</p>
          <p><b>Altitud (m):</b> ${d.altitude ?? 0}</p>
          <p><b>Precisión:</b> ${d.precision ?? 0}</p>
          <p><b>EPSG/WGS84:</b> ${d.EPSG ?? "WGS84"}</p>
          <p><b>Zona:</b> ${d.zona ?? ""}</p>
          <p><b>Rampa:</b> ${d.rampa ?? ""}</p>
          <p><b>Galería:</b> ${d.galeria ?? ""}</p>
          <p><b>Sector:</b> ${d.sector ?? ""}</p>
          <p><b>Nombre estación:</b> ${d.nombreEstacion ?? ""}</p>
          <p><b>País:</b> ${d.pais ?? ""}</p>
          <p><b>Región:</b> ${d.region ?? ""}</p>
          <p><b>Comuna:</b> ${d.comuna ?? ""}</p>
          <p><b>Nombre mina:</b> ${d.nombreMina ?? ""}</p>
          <p><b>Nombre empresa:</b> ${d.nombreEmpresa ?? ""}</p>
          <p>CO: ${d.CO ?? 0} ppm</p>
          <p>CO₂: ${d.CO2 ?? 0} ppm</p>
          <p>PM10: ${d.PM10 ?? 0} µg/m³</p>
          <p>PM2.5: ${d.PM2_5 ?? 0} µg/m³</p>
          <p>Humedad: ${d.humedad ?? 0}%</p>
          <p>Temperatura: ${d.temperatura ?? 0} °C</p>
        `;
      });
    }
  });
}
