// ================================================
// userDashboard.js — Gestión de Usuario y Tipos de Mina (Solo Lectura)
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

      <h3>Datos del Usuario (Solo Lectura)</h3>
      <form id="editForm" class="card">

        <h4>Datos Personales</h4>
        <label>Nombre:</label><input type="text" id="nombre" placeholder="Nombre completo" />
        <label>Teléfono:</label><input type="text" id="telefono" placeholder="Teléfono" />
        <label>Dirección:</label><input type="text" id="direccion" placeholder="Dirección" />
        <label>ID del Dispositivo:</label><input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" />
        <label>Rol:</label>
        <select id="isAdmin">
          <option value="false">Usuario Normal</option>
          <option value="true">Administrador</option>
        </select>

        <h4>Tipo de Mina</h4>
        <select id="tipoMina" disabled>
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
  document.getElementById("logout").onclick = async () => { 
    await auth.signOut(); 
    navigate("login"); 
  };

  const camposMinaDiv = document.getElementById("camposMina");
  const tipoSelect = document.getElementById("tipoMina");

  function renderCampos(tipo) {
    let html = "";
    switch (tipo) {
      case "subterranea":
        html = `
          <h4>⛏️ Subterránea</h4>
          <label>Zona:</label><input id="zona" disabled />
          <label>Rampa:</label><input id="rampa" disabled />
          <label>Galería:</label><input id="galeria" disabled />
          <label>Sector:</label><input id="sector" disabled />
          <label>Nombre de estación:</label><input id="nombreEstacion" disabled />
        `;
        break;
      case "tajo_abierto":
        html = `
          <h4>🪨 Tajo Abierto</h4>
          <label>Banco:</label><input id="banco" disabled />
          <label>Fase:</label><input id="fase" disabled />
          <label>Frente:</label><input id="frente" disabled />
          <label>Coordenadas GPS:</label><input id="coordGPS" disabled />
        `;
        break;
      case "aluvial":
        html = `
          <h4>💧 Aluvial (placer)</h4>
          <label>Mina:</label><input id="mina" disabled />
          <label>Río:</label><input id="rio" disabled />
          <label>Tramo:</label><input id="tramo" disabled />
          <label>Cuadrante:</label><input id="cuadrante" disabled />
          <label>Coordenadas GPS:</label><input id="coordGPS" disabled />
        `;
        break;
      case "cantera":
        html = `
          <h4>🏗️ Cantera</h4>
          <label>Cantera:</label><input id="cantera" disabled />
          <label>Material:</label><input id="material" disabled />
          <label>Frente:</label><input id="frente" disabled />
          <label>Coordenadas GPS:</label><input id="coordGPS" disabled />
          <label>Polígono:</label><input id="poligono" disabled />
        `;
        break;
      case "pirquen":
        html = `
          <h4>🧰 Pirquén / Artesanal</h4>
          <label>Faena:</label><input id="faena" disabled />
          <label>Tipo de explotación:</label><input id="tipoExplotacion" disabled />
          <label>Sector:</label><input id="sector" disabled />
          <label>Coordenadas:</label><input id="coordGPS" disabled />
          <label>Nivel (si aplica):</label><input id="nivel" disabled />
        `;
        break;
      default:
        html = "";
    }
    camposMinaDiv.innerHTML = html;
  }

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

      // Cargar inputs con datos (solo lectura)
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("telefono").value = data.telefono || "";
      document.getElementById("direccion").value = data.direccion || "";
      document.getElementById("deviceId").value = data.deviceId || "";
      document.getElementById("isAdmin").value = data.isAdmin ? "true" : "false";
      document.getElementById("techLat").value = data.latitude ?? "";
      document.getElementById("techLng").value = data.longitude ?? "";
      document.getElementById("techAlt").value = data.altitude ?? "";
      document.getElementById("techPrecision").value = data.precision ?? "";
      document.getElementById("techEPSG").value = data.EPSG ?? "WGS84";
      document.getElementById("geoPais").value = data.pais ?? "";
      document.getElementById("geoRegion").value = data.region ?? "";
      document.getElementById("geoComuna").value = data.comuna ?? "";
      document.getElementById("geoMina").value = data.nombreMina ?? "";
      document.getElementById("geoEmpresa").value = data.nombreEmpresa ?? "";

      tipoSelect.value = data.tipoMina || "";
      renderCampos(tipoSelect.value);
    });

    // --- Mostrar datos del dispositivo
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

    // --- Llamada inicial
    const userDeviceId = document.getElementById("deviceId").value;
    if (userDeviceId) mostrarDatosDispositivo(userDeviceId);
  });
}
