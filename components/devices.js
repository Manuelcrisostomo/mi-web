// ================================================
// device.js - Gestión de Usuarios, Dispositivos y Perfil (Diseño Mejorado Bootstrap)
// ================================================

import {
  auth, db, firestore, ref, onValue, get, remove, onAuthStateChanged
} from "../firebaseConfig.js";

import { doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";
import { showHistoryManagerPage } from "./historyManager.js";
import { showPagina1, showPagina2 } from "./paginas.js";

// =====================================================
// DASHBOARD USUARIO
// =====================================================
export function showUserDashboard() {
  const root = document.getElementById("root");
  root.innerHTML = `
  <div class="container py-4">
    <div class="text-center mb-4">
      <h2>Minesafe 2</h2>
      <h5>Perfil del Usuario</h5>
    </div>

    <!-- Info Usuario -->
    <div class="card mb-4 shadow-sm">
      <div class="card-body" id="userInfo">
        <p><strong>Nombre correo:</strong> Cargando...</p>
        <p><strong>Teléfono:</strong> Cargando...</p>
        <p><strong>Estación de trabajo:</strong> PC</p>
        <p><strong>RUT:</strong> -</p>
        <p><strong>Dato Diagnóstico:</strong> -</p>
      </div>
    </div>

    <!-- Editor Datos del Usuario -->
    <div class="card mb-4 shadow-sm">
      <div class="card-header bg-primary text-white">
        <h6 class="mb-0">Editor Datos del Usuario</h6>
      </div>
      <div class="card-body">
        <form id="editForm">
          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre</label>
            <input type="text" id="nombre" class="form-control" placeholder="Nombre" />
          </div>
          <div class="mb-3">
            <label for="telefono" class="form-label">Teléfono</label>
            <input type="text" id="telefono" class="form-control" placeholder="Teléfono" />
          </div>
          <div class="mb-3">
            <label for="rut" class="form-label">RUT</label>
            <input type="text" id="rut" class="form-control" placeholder="Rut" />
          </div>
          <div class="mb-3">
            <label for="datoDiagnostico" class="form-label">Dato Diagnóstico</label>
            <input type="text" id="datoDiagnostico" class="form-control" placeholder="Dato Diagnóstico" />
          </div>

          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="checkEstado" />
            <label for="checkEstado" class="form-check-label">Activo</label>
          </div>
          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary flex-fill">Guardar Usuario</button>
            <button type="button" id="deleteUser" class="btn btn-danger flex-fill">Eliminar Usuario</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Datos Usuario Ocupación -->
    <div class="card mb-4 shadow-sm">
      <div class="card-header bg-secondary text-white">
        <h6 class="mb-0">Datos Usuario Ocupación</h6>
      </div>
      <div class="card-body">
        <form>
          <div class="mb-3">
            <label for="zona" class="form-label">Zona</label>
            <input type="text" id="zona" class="form-control" placeholder="Zona" />
          </div>
          <div class="mb-3">
            <label for="empresa" class="form-label">Empresa</label>
            <input type="text" id="empresa" class="form-control" placeholder="Empresa" />
          </div>
          <div class="mb-3">
            <label for="gremio" class="form-label">Gremio</label>
            <input type="text" id="gremio" class="form-control" placeholder="Gremio" />
          </div>
          <div class="mb-3">
            <label for="cargo" class="form-label">Cargo</label>
            <input type="text" id="cargo" class="form-control" placeholder="Cargo" />
          </div>
          <div class="mb-3">
            <label for="experiencia" class="form-label">Tiempo de experiencia</label>
            <input type="text" id="experiencia" class="form-control" placeholder="Tiempo de experiencia" />
          </div>
        </form>
      </div>
    </div>

    <!-- Datos Técnicos (Mapa / Sistema) -->
    <div class="card mb-4 shadow-sm">
      <div class="card-header bg-info text-white">
        <h6 class="mb-0">Datos Técnicos (Mapa / Sistema)</h6>
      </div>
      <div class="card-body">
        <form>
          <div class="mb-3">
            <label for="latitud" class="form-label">Latitud</label>
            <input type="text" id="latitud" class="form-control" placeholder="Latitud" />
          </div>
          <div class="mb-3">
            <label for="longitud" class="form-label">Longitud</label>
            <input type="text" id="longitud" class="form-control" placeholder="Longitud" />
          </div>
          <div class="mb-3">
            <label for="altitud" class="form-label">Altitud (m)</label>
            <input type="text" id="altitud" class="form-control" placeholder="Altitud" />
          </div>
          <div class="mb-3">
            <label for="precision" class="form-label">Precisión</label>
            <input type="text" id="precision" class="form-control" placeholder="Precisión" />
          </div>
          <div class="mb-3">
            <label for="epsg" class="form-label">EPSG/WGS84</label>
            <input type="text" id="epsg" class="form-control" placeholder="EPSG/WGS84" />
          </div>
        </form>
      </div>
    </div>

    <!-- Datos Geográficos / Empresariales -->
    <div class="card mb-4 shadow-sm">
      <div class="card-header bg-warning text-dark">
        <h6 class="mb-0">Datos Geográficos / Empresariales</h6>
      </div>
      <div class="card-body">
        <form>
          <div class="mb-3">
            <label for="pais" class="form-label">País</label>
            <input type="text" id="pais" class="form-control" placeholder="País" />
          </div>
          <div class="mb-3">
            <label for="region" class="form-label">Región</label>
            <input type="text" id="region" class="form-control" placeholder="Región" />
          </div>
          <div class="mb-3">
            <label for="comuna" class="form-label">Comuna</label>
            <input type="text" id="comuna" class="form-control" placeholder="Comuna" />
          </div>
          <div class="mb-3">
            <label for="mina" class="form-label">Nombre de la mina</label>
            <input type="text" id="mina" class="form-control" placeholder="Nombre de la mina" />
          </div>
          <div class="mb-3">
            <label for="empresaGeo" class="form-label">Nombre de la empresa</label>
            <input type="text" id="empresaGeo" class="form-control" placeholder="Nombre de la empresa" />
          </div>
        </form>
      </div>
    </div>

    <footer class="text-center py-3 text-muted">
      &copy; 2025 Minesafe 2
    </footer>
  </div>
  `;

  // =====================================================
  // CARGA DATOS FIREBASE
  // =====================================================
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore, "users", userId);

    onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};

      document.getElementById("userInfo").innerHTML = `
        <p><strong>Correo:</strong> ${userEmail}</p>
        <p><strong>Teléfono:</strong> ${data.telefono || "-"}</p>
        <p><strong>Estación:</strong> PC</p>
        <p><strong>RUT:</strong> ${data.rut || "-"}</p>
        <p><strong>Dato Diagnóstico:</strong> ${data.datoDiagnostico || "-"}</p>
      `;

      ["nombre","telefono","rut","datoDiagnostico"].forEach(id => {
        document.getElementById(id).value = data[id] || "";
      });
      document.getElementById("checkEstado").checked = data.activo || false;
    });

    // GUARDAR DATOS
    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();
      const updatedData = {
        nombre: nombre.value.trim(),
        telefono: telefono.value.trim(),
        rut: rut.value.trim(),
        datoDiagnostico: datoDiagnostico.value.trim(),
        activo: checkEstado.checked,
        email: userEmail,
        updatedAt: new Date().toISOString(),
      };
      try {
        await setDoc(userDocRef, updatedData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), updatedData);
        alert("✅ Datos guardados correctamente");
      } catch (err) {
        alert("❌ Error: " + err.message);
      }
    };

    // ELIMINAR USUARIO
    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Deseas eliminar este usuario?")) return;
      try {
        await deleteDoc(userDocRef);
        await remove(ref(db, `usuarios/${userId}`));
        alert("Usuario eliminado correctamente");
        navigate("login");
      } catch (err) {
        alert("❌ Error al eliminar: " + err.message);
      }
    };
  });
}

// =====================================================
// FUNCIONES PARA DISPOSITIVOS Y HISTORIAL
// =====================================================
export function showAllDevices() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard container py-4">
      <h2>Todos los Dispositivos</h2>
      <div id="deviceList" class="mb-3">Cargando dispositivos...</div>
      <button id="backBtn" class="btn btn-secondary">Volver</button>
    </div>
  `;
  document.getElementById("backBtn").onclick = () => showUserDashboard();

  const devicesRef = ref(db, "dispositivos");
  onValue(devicesRef, (snapshot) => {
    const devices = snapshot.val() || {};
    const listDiv = document.getElementById("deviceList");
    listDiv.innerHTML = "<ul class='list-group'>";
    for (const id in devices) {
      const name = devices[id].name || `Dispositivo ${id}`;
      listDiv.innerHTML += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${name} (ID: ${id})
          <button class="btn btn-sm btn-outline-primary" onclick="showHistoricalPage('${id}')">📜 Ver historial</button>
        </li>
      `;
    }
    listDiv.innerHTML += "</ul>";
  });
}

export function showHistoricalPage(deviceId) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard container py-4">
      <h2>Historial del Dispositivo</h2>
      <p><b>ID:</b> ${deviceId}</p>
      <div class="d-flex gap-2 mb-3">
        <button id="exportExcelBtn" class="btn btn-success" disabled>💾 Exportar a Excel</button>
        <button id="backBtn" class="btn btn-secondary">Volver</button>
      </div>
      <h3>Historial del dispositivo</h3>
      <div id="historialContainer" class="d-flex flex-wrap gap-2 mb-3"></div>
      <h3>Historial global</h3>
      <div id="historialGlobalContainer" class="d-flex flex-wrap gap-2"></div>
    </div>
  `;

  const historialDiv = document.getElementById("historialContainer");
  const historialGlobalDiv = document.getElementById("historialGlobalContainer");
  const exportExcelBtn = document.getElementById("exportExcelBtn");

  document.getElementById("backBtn").onclick = () => showAllDevices();

  let registrosLocal = [];
  let registrosGlobal = [];

  const historialRef = ref(db, `dispositivos/${deviceId}/historial`);
  onValue(historialRef, (snap) => {
    const data = snap.val() || {};
    historialDiv.innerHTML = "";
    registrosLocal = Object.entries(data).sort((a,b)=>parseInt(b[0])-parseInt(a[0]));
    registrosLocal.forEach(([ts,val]) => {
      const fecha = new Date(parseInt(ts)).toLocaleString("es-CL",{dateStyle:"short",timeStyle:"medium"});
      const card = document.createElement("div"); 
      card.className="card p-2 mb-2 shadow-sm";
      card.innerHTML = `<h6>${fecha}</h6>
        <p>CO: ${val.CO ?? "—"} ppm</p>
        <p>CO₂: ${val.CO2 ?? "—"} ppm</p>
        <p>PM10: ${val.PM10 ?? "—"} µg/m³</p>
        <p>PM2.5: ${val.PM2_5 ?? "—"} µg/m³</p>
        <p>Humedad: ${val.humedad ?? "—"}%</p>
        <p>Temperatura: ${val.temperatura ?? "—"} °C</p>`;
      historialDiv.appendChild(card);
    });
    exportExcelBtn.disabled = registrosLocal.length===0 && registrosGlobal.length===0;
  });

  const historialGlobalRef = ref(db, `dispositivos/${deviceId}/historial_global`);
  onValue(historialGlobalRef, (snap) => {
    const data = snap.val() || {};
    historialGlobalDiv.innerHTML = "";
    registrosGlobal = Object.entries(data).sort((a,b)=>parseInt(b[0])-parseInt(a[0]));
    registrosGlobal.forEach(([ts,val])=>{
      const fecha = new Date(parseInt(ts)).toLocaleString("es-CL",{dateStyle:"short",timeStyle:"medium"});
      const card = document.createElement("div"); 
      card.className="card p-2 mb-2 shadow-sm";
      card.innerHTML = `<h6>${fecha}</h6>
        <p>CO: ${val.CO ?? "—"} ppm</p>
        <p>CO₂: ${val.CO2 ?? "—"} ppm</p>
        <p>PM10: ${val.PM10 ?? "—"} µg/m³</p>
        <p>PM2.5: ${val.PM2_5 ?? "—"} µg/m³</p>
        <p>Humedad: ${val.humedad ?? "—"}%</p>
                <p>Temperatura: ${val.temperatura ?? "—"} °C</p>`;
      historialGlobalDiv.appendChild(card);
    });
    exportExcelBtn.disabled = registrosLocal.length === 0 && registrosGlobal.length === 0;
  });

  exportExcelBtn.onclick = () => exportToExcelMultiSheet(deviceId, registrosLocal, registrosGlobal);
}

// ================================================
// FUNCIONES AUXILIARES
// ================================================
async function exportToExcelMultiSheet(deviceId, registrosLocal, registrosGlobal) {
  let userEmail = "Sin asignar";
  try {
    const snap = await get(ref(db, "usuarios"));
    const usuarios = snap.val() || {};
    for (let uid in usuarios) {
      if (usuarios[uid].deviceId === deviceId) {
        userEmail = usuarios[uid].email || userEmail;
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }

  const hojaLocal = [["Fecha", "CO", "CO2", "PM10", "PM2.5", "Humedad", "Temperatura", "Usuario", "Dispositivo"]];
  registrosLocal.forEach(([ts, val]) => hojaLocal.push([
    new Date(parseInt(ts)).toLocaleString("es-CL"),
    val.CO ?? "", val.CO2 ?? "", val.PM10 ?? "", val.PM2_5 ?? "",
    val.humedad ?? "", val.temperatura ?? "", userEmail, deviceId
  ]));

  const hojaGlobal = [["Fecha", "CO", "CO2", "PM10", "PM2.5", "Humedad", "Temperatura", "Usuario", "Dispositivo"]];
  registrosGlobal.forEach(([ts, val]) => hojaGlobal.push([
    new Date(parseInt(ts)).toLocaleString("es-CL"),
    val.CO ?? "", val.CO2 ?? "", val.PM10 ?? "", val.PM2_5 ?? "",
    val.humedad ?? "", val.temperatura ?? "", userEmail, deviceId
  ]));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hojaLocal), "Historial Local");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hojaGlobal), "Historial Global");
  XLSX.writeFile(wb, `historial_${deviceId}.xlsx`);
}

// ================================================
// FUNCIÓN PARA MOSTRAR DATOS DE UN DISPOSITIVO
// ================================================
export function mostrarDatosDispositivo(deviceId, userData = {}) {
  const deviceRef = ref(db, `dispositivos/${deviceId}`);
  const deviceContainer = document.getElementById("deviceData");

  onValue(deviceRef, (snapshot) => {
    const d = snapshot.val();
    if (!d) return deviceContainer.innerHTML = `<p>No se encontró el dispositivo ${deviceId}</p>`;

    deviceContainer.innerHTML = `
      <p><strong>ID:</strong> ${deviceId}</p>
      <p><strong>Latitud:</strong> ${d.latitude ?? userData.latitude ?? "-"}</p>
      <p><strong>Longitud:</strong> ${d.longitude ?? userData.longitude ?? "-"}</p>
      <p><strong>Altitud:</strong> ${d.altitude ?? userData.altitude ?? "-"}</p>
      <p><strong>Precisión:</strong> ${d.precision ?? userData.precision ?? "-"}</p>
      <p><strong>Zona:</strong> ${d.zona ?? userData.zona ?? "-"}</p>
      <p><strong>Región:</strong> ${d.region ?? userData.region ?? "-"}</p>
      <p><strong>Comuna:</strong> ${d.comuna ?? userData.comuna ?? "-"}</p>
    `;
  });
}

