// ================================================
// userDashboardFull.js — Dashboard completo con historial y exportaciones
// ================================================

import {
  auth,
  db,
  firestore,
  ref,
  onValue,
  set,
  remove,
  get,
  onAuthStateChanged
} from "../firebaseConfig.js";

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
import jsPDF from "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";

import { navigate } from "../app.js";

// ================================================
// DASHBOARD DE USUARIO
// ================================================
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
        <button id="historyBtn">Historial</button>
        <button id="logout">Cerrar Sesión</button>
      </div>
    </div>
  `;

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
          <label>Nombre estación:</label><input id="nombreEstacion" placeholder="Nombre estación" />
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
          <h4>💧 Aluvial</h4>
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
          <label>Tipo explotación:</label><input id="tipoExplotacion" placeholder="Tipo de explotación" />
          <label>Sector:</label><input id="sector" placeholder="Sector" />
          <label>Coordenadas:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
          <label>Nivel:</label><input id="nivel" placeholder="Nivel" />
        `;
        break;
      default:
        html = "";
    }
    camposMinaDiv.innerHTML = html;
  }

  tipoSelect.addEventListener("change", (e) => renderCampos(e.target.value));

  // --- Navegación
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => showDevices();
  document.getElementById("historyBtn").onclick = () => showDeviceHistoryCurrentUser();
  document.getElementById("logout").onclick = async () => { await auth.signOut(); navigate("login"); };

  // --- Carga y edición de datos
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
        <p><b>Tipo de mina:</b> ${data.tipoMina || "-"}</p>
      `;
      tipoSelect.value = data.tipoMina || "";
      renderCampos(tipoSelect.value);
      if(data.deviceId) mostrarDatosDispositivo(data.deviceId);
    });

    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();
      const tipoMina = tipoSelect.value;
      const camposExtras = {};
      camposMinaDiv.querySelectorAll("input").forEach(input => camposExtras[input.id] = input.value.trim());

      const updatedData = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        deviceId: document.getElementById("deviceId").value.trim(),
        tipoMina,
        ...camposExtras,
        latitude: parseFloat(document.getElementById("techLat").value) || 0,
        longitude: parseFloat(document.getElementById("techLng").value) || 0,
        altitude: parseFloat(document.getElementById("techAlt").value) || 0,
        precision: parseFloat(document.getElementById("techPrecision").value) || 0,
        EPSG: document.getElementById("techEPSG").value.trim(),
        pais: document.getElementById("geoPais").value.trim(),
        region: document.getElementById("geoRegion").value.trim(),
        comuna: document.getElementById("geoComuna").value.trim(),
        nombreMina: document.getElementById("geoMina").value.trim(),
        nombreEmpresa: document.getElementById("geoEmpresa").value.trim()
      };

      await setDoc(userDocRef, updatedData, { merge: true });
      alert("✅ Datos guardados correctamente.");
    };

    document.getElementById("deleteUser").onclick = async () => {
      if (confirm("⚠️ ¿Seguro que desea eliminar este usuario?")) {
        await deleteDoc(userDocRef);
        alert("Usuario eliminado.");
        navigate("login");
      }
    };
  });

  // --- Mostrar datos del dispositivo
  function mostrarDatosDispositivo(deviceId) {
    const deviceDiv = document.getElementById("deviceData");
    const deviceRef = doc(firestore, "devices", deviceId);
    onSnapshot(deviceRef, snap => {
      const d = snap.exists() ? snap.data() : {};
      deviceDiv.innerHTML = `
        <p><b>ID:</b> ${deviceId}</p>
        <p><b>Última actualización:</b> ${d.lastUpdate || "-"}</p>
        <p><b>Estado:</b> ${d.status || "-"}</p>
        <p><b>Ubicación:</b> ${d.latitude ?? "-"}, ${d.longitude ?? "-"}</p>
      `;
    });
  }
}

// ================================================
// HISTORIAL DE DISPOSITIVO DEL USUARIO ACTUAL
// ================================================
function showDeviceHistoryCurrentUser() {
  const user = auth.currentUser;
  if (!user) return alert("No hay usuario autenticado.");

  const root = document.getElementById("root");
  root.innerHTML = `
    <h2>Historial de Dispositivos</h2>
    <table id="historyTable">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Dispositivo</th>
          <th>Tipo Mina</th>
          <th>Lat</th>
          <th>Lng</th>
          <th>Altitud</th>
          <th>Precisión</th>
          <th>EPSG</th>
          <th>País</th>
          <th>Región</th>
          <th>Comuna</th>
          <th>Nombre Mina</th>
          <th>Empresa</th>
          <th>Comentarios</th>
        </tr>
      </thead>
      <tbody id="historyBody"></tbody>
    </table>
    <button id="exportExcel">Exportar Excel</button>
    <button id="exportPDF">Exportar PDF</button>
  `;

  const historyBody = document.getElementById("historyBody");
  const histRef = collection(firestore, "users", user.uid, "history");

  onSnapshot(histRef, snapshot => {
    historyBody.innerHTML = "";
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.fecha || "-"}</td>
        <td>${data.deviceId || "-"}</td>
        <td>${data.tipoMina || "-"}</td>
        <td>${data.latitude ?? "-"}</td>
        <td>${data.longitude ?? "-"}</td>
        <td>${data.altitude ?? "-"}</td>
        <td>${data.precision ?? "-"}</td>
        <td>${data.EPSG || "-"}</td>
        <td>${data.pais || "-"}</td>
        <td>${data.region || "-"}</td>
        <td>${data.comuna || "-"}</td>
        <td>${data.nombreMina || "-"}</td>
        <td>${data.nombreEmpresa || "-"}</td>
        <td>${data.comentarios || "-"}</td>
      `;
      historyBody.appendChild(row);
    });
  });

  document.getElementById("exportExcel").onclick = () => {
    const wb = XLSX.utils.table_to_book(document.getElementById("historyTable"), { sheet: "Historial" });
    XLSX.writeFile(wb, "HistorialDispositivos.xlsx");
  };

  document.getElementById("exportPDF").onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("l", "pt", "a4");
    doc.html(document.getElementById("historyTable"), {
      callback: function(pdf) { pdf.save("HistorialDispositivos.pdf"); },
      margin: [20,20,20,20],
      x: 10,
      y: 10
    });
  };
}
