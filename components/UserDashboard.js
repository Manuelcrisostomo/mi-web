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

import {
  update
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import { navigate } from "../app.js";

export function showUserDashboard() {
  const root = document.getElementById("root");

  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card"></div>

      <h3>Editar Datos del Usuario</h3>
      <form id="editForm" class="card">
        <label>Nombre:</label>
        <input type="text" id="nombre" placeholder="Nombre completo" />
        <label>Teléfono:</label>
        <input type="text" id="telefono" placeholder="Teléfono" />
        <label>Dirección:</label>
        <input type="text" id="direccion" placeholder="Dirección" />
        <label>ID del Dispositivo:</label>
        <input type="text" id="deviceId" placeholder="Ej: device_38A839E81F84" />
        <label>Rol:</label>
        <select id="isAdmin">
          <option value="false">Usuario Normal</option>
          <option value="true">Administrador</option>
        </select>
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

  // 🔹 Botones de navegación
  document.getElementById("alertsBtn").onclick = () => navigate("alerts");
  document.getElementById("devicesBtn").onclick = () => navigate("devices");
  document.getElementById("logout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // 🔹 Autenticación
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      root.innerHTML = "<p>No hay usuario autenticado.</p>";
      return;
    }

    const userEmail = user.email;
    const userId = user.uid;
    const userDocRef = doc(firestore, "users", userId);

    document.getElementById("userProfile").innerHTML = `
      <p><b>Correo actual:</b> ${userEmail}</p>
      <p>Cargando datos...</p>
    `;

    // 🔹 Escuchar datos del usuario en Firestore
    onSnapshot(userDocRef, (docSnap) => {
      const data = docSnap.exists() ? docSnap.data() : {};
      const rolTexto = data.isAdmin ? "Administrador" : "Usuario Normal";

      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "No registrado"}</p>
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

      if (data.deviceId) mostrarDatosDispositivo(data.deviceId);
    });

    // 🔹 Guardar cambios
    document.getElementById("editForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const direccion = document.getElementById("direccion").value.trim();
      const deviceId = document.getElementById("deviceId").value.trim();
      const isAdmin = document.getElementById("isAdmin").value === "true";

      const newData = {
        nombre,
        telefono,
        direccion,
        deviceId,
        isAdmin,
        email: userEmail,
        updatedAt: new Date().toISOString()
      };

      try {
        // 🔸 Guardar en Firestore
        await setDoc(userDocRef, newData, { merge: true });

        // 🔸 Guardar en Realtime Database
        const userRef = ref(db, `usuarios/${userId}`);
        await update(userRef, newData);

        // 🔸 Vincular dispositivo al usuario
        if (deviceId) {
          const deviceRef = ref(db, `dispositivos/${deviceId}`);
          const deviceSnap = await get(deviceRef);
          if (deviceSnap.exists()) {
            await update(deviceRef, { userEmail }); // ✅ No borra los demás campos
          } else {
            alert(`⚠️ El dispositivo "${deviceId}" no existe.`);
          }
        }

        alert("✅ Datos actualizados correctamente.");
        if (deviceId) mostrarDatosDispositivo(deviceId);
      } catch (error) {
        console.error(error);
        alert(`❌ Error al guardar: ${error.message}`);
      }
    });

    // 🔹 Eliminar usuario
    document.getElementById("deleteUser").addEventListener("click", async () => {
      if (!confirm("¿Seguro que deseas borrar este usuario?")) return;

      try {
        await deleteDoc(userDocRef);
        await remove(ref(db, `usuarios/${userId}`));
        alert("🗑️ Usuario eliminado correctamente.");
        navigate("login");
      } catch (error) {
        console.error(error);
        alert(`❌ No se pudo borrar el usuario: ${error.message}`);
      }
    });

    // 🔹 Mostrar datos del dispositivo
    function mostrarDatosDispositivo(deviceId) {
      const deviceRef = ref(db, `dispositivos/${deviceId}`);
      onValue(deviceRef, (snapshot) => {
        const d = snapshot.val();
        if (!d) {
          document.getElementById("deviceData").innerHTML = `<p>No se encontró el dispositivo <b>${deviceId}</b></p>`;
          return;
        }

        document.getElementById("deviceData").innerHTML = `
          <p><b>ID:</b> ${deviceId}</p>
          <p><b>Nombre:</b> ${d.name || "Desconocido"}</p>
          <p><b>Usuario:</b> ${d.userEmail || "Sin asignar"}</p>
          <p>CO: ${d.CO ?? 0} ppm</p>
          <p>CO₂: ${d.CO2 ?? 0} ppm</p>
          <p>PM10: ${d.PM10 ?? 0} µg/m³</p>
          <p>PM2.5: ${d.PM2_5 ?? 0} µg/m³</p>
          <p>Humedad: ${d.humedad ?? 0}%</p>
          <p>Temperatura: ${d.temperatura ?? 0} °C</p>
        `;
      }, (error) => {
        document.getElementById("deviceData").innerHTML = `<p>Error al cargar dispositivo: ${error.message}</p>`;
        console.error(error);
      });
    }
  });
}
