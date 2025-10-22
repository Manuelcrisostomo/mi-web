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
        <label>Rol:</label>
        <select id="isAdmin">
          <option value="false">Usuario Normal</option>
          <option value="true">Administrador</option>
        </select>

        <h4>Datos Humanos (Operador)</h4>
        <label>Zona:</label><input type="text" id="humanZona" placeholder="Zona" />
        <label>Rampa:</label><input type="text" id="humanRampa" placeholder="Rampa" />
        <label>Galería:</label><input type="text" id="humanGaleria" placeholder="Galería" />
        <label>Sector:</label><input type="text" id="humanSector" placeholder="Sector" />
        <label>Nombre de estación:</label><input type="text" id="humanEstacion" placeholder="Nombre de estación" />

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

  // Botones de navegación
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("logout").onclick = async () => { await auth.signOut(); navigate("login"); };

  onAuthStateChanged(auth, async (user) => {
    if (!user) return root.innerHTML = "<p>No hay usuario autenticado.</p>";

    const userEmail = user.email;
    const userId = user.uid;
    const userDocRef = doc(firestore, "users", userId);

    document.getElementById("userProfile").innerHTML = `<p>Cargando datos...</p>`;

    onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      const rolTexto = data.isAdmin ? "Administrador" : "Usuario Normal";

      // Mostrar perfil
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Correo:</b> ${userEmail}</p>
        <p><b>Teléfono:</b> ${data.telefono || "-"}</p>
        <p><b>Dirección:</b> ${data.direccion || "-"}</p>
        <p><b>Rol:</b> ${rolTexto}</p>
        <p><b>ID del Dispositivo:</b> ${data.deviceId || "No asignado"}</p>
      `;

      // Rellenar formulario
      document.getElementById("nombre").value = data.nombre || "";
      document.getElementById("telefono").value = data.telefono || "";
      document.getElementById("direccion").value = data.direccion || "";
      document.getElementById("deviceId").value = data.deviceId || "";
      document.getElementById("isAdmin").value = data.isAdmin ? "true" : "false";

      document.getElementById("humanZona").value = data.zona || "";
      document.getElementById("humanRampa").value = data.rampa || "";
      document.getElementById("humanGaleria").value = data.galeria || "";
      document.getElementById("humanSector").value = data.sector || "";
      document.getElementById("humanEstacion").value = data.nombreEstacion || "";

      document.getElementById("techLat").value = data.latitude ?? 0;
      document.getElementById("techLng").value = data.longitude ?? 0;
      document.getElementById("techAlt").value = data.altitude ?? 0;
      document.getElementById("techPrecision").value = data.precision ?? 0;
      document.getElementById("techEPSG").value = data.EPSG ?? "WGS84";

      document.getElementById("geoPais").value = data.pais || "";
      document.getElementById("geoRegion").value = data.region || "";
      document.getElementById("geoComuna").value = data.comuna || "";
      document.getElementById("geoMina").value = data.nombreMina || "";
      document.getElementById("geoEmpresa").value = data.nombreEmpresa || "";

      if (data.deviceId) mostrarDatosDispositivo(data.deviceId, data);
    });

    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const direccion = document.getElementById("direccion").value.trim();
      const deviceId = document.getElementById("deviceId").value.trim();
      const isAdmin = document.getElementById("isAdmin").value === "true";

      const zona = document.getElementById("humanZona").value.trim();
      const rampa = document.getElementById("humanRampa").value.trim();
      const galeria = document.getElementById("humanGaleria").value.trim();
      const sector = document.getElementById("humanSector").value.trim();
      const nombreEstacion = document.getElementById("humanEstacion").value.trim();

      const latitude = parseFloat(document.getElementById("techLat").value) || 0;
      const longitude = parseFloat(document.getElementById("techLng").value) || 0;
      const altitude = parseFloat(document.getElementById("techAlt").value) || 0;
      const precision = parseFloat(document.getElementById("techPrecision").value) || 0;
      const EPSG = document.getElementById("techEPSG").value.trim();

      const pais = document.getElementById("geoPais").value.trim();
      const region = document.getElementById("geoRegion").value.trim();
      const comuna = document.getElementById("geoComuna").value.trim();
      const nombreMina = document.getElementById("geoMina").value.trim();
      const nombreEmpresa = document.getElementById("geoEmpresa").value.trim();

      const updatedData = {
        nombre, telefono, direccion, deviceId, isAdmin, email: userEmail,
        zona, rampa, galeria, sector, nombreEstacion,
        latitude, longitude, altitude, precision, EPSG,
        pais, region, comuna, nombreMina, nombreEmpresa,
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(firestore, "users", userId), updatedData, { merge: true });
        await update(ref(db, `usuarios/${userId}`), updatedData);

        if (deviceId) {
          const deviceRef = ref(db, `dispositivos/${deviceId}`);
          const deviceSnap = await get(deviceRef);
          if (deviceSnap.exists()) {
            await update(deviceRef, {
              latitude, longitude, altitude, precision, EPSG,
              zona, rampa, galeria, sector, nombreEstacion,
              pais, region, comuna, nombreMina, nombreEmpresa,
              userEmail
            });
          }
        }

        alert("✅ Datos actualizados correctamente");
        if (deviceId) mostrarDatosDispositivo(deviceId);
      } catch (err) {
        console.error(err);
        alert("❌ Error al actualizar: " + err.message);
      }
    };

    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Desea borrar este usuario?")) return;
      try {
        await deleteDoc(doc(firestore, "users", userId));
        await remove(ref(db, `usuarios/${userId}`));
        alert("Usuario eliminado");
        navigate("login");
      } catch (err) {
        console.error(err);
        alert("Error al eliminar: " + err.message);
      }
    };

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
