// ================================================
// userDashboard.js — Panel del Usuario (DISEÑO MODERNO)
// ================================================
import {
  auth,
  db,
  firestore,
  ref,
  remove,
  onValue,
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
    <style>
      /* === ESTILOS GENERALES === */
      body {
        font-family: 'Segoe UI', Tahoma, sans-serif;
        background-color: #f6f7fb;
        margin: 0;
        padding: 0;
      }

      .navbar {
        background-color: #111;
        padding: 0.6rem 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        position: sticky;
        top: 0;
        z-index: 999;
      }

      .navbar-brand {
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
      }

      .navbar-buttons {
        display: flex;
        gap: 0.4rem;
      }

      .navbar button {
        border: none;
        color: white;
        font-weight: 600;
        border-radius: 5px;
        padding: 6px 10px;
        cursor: pointer;
        transition: 0.2s;
      }

      .navbar button:hover {
        opacity: 0.8;
        transform: scale(1.05);
      }

      .btn-green { background-color: #198754; }  /* verde */
      .btn-blue { background-color: #0d6efd; }   /* azul */
      .btn-yellow { background-color: #ffc107; color: #111; } /* amarillo */
      .btn-red { background-color: #dc3545; }    /* rojo */
      .btn-cyan { background-color: #0dcaf0; color: #111; }   /* celeste */
      .btn-orange { background-color: #fd7e14; } /* naranja */

      .dashboard {
        padding: 20px;
        max-width: 900px;
        margin: 30px auto;
        background: white;
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      }

      h2, h3, h4 {
        color: #222;
        margin-top: 10px;
      }

      input, select {
        width: 100%;
        margin-bottom: 10px;
        padding: 8px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-size: 0.95rem;
      }

      label {
        font-weight: 500;
        display: block;
        margin-top: 8px;
        color: #333;
      }

      .card {
        background: #fafafa;
        border-radius: 8px;
        padding: 15px;
        border: 1px solid #ddd;
        margin-bottom: 10px;
      }

      .btn {
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        font-weight: 600;
        transition: 0.3s;
      }

      .btn:hover {
        opacity: 0.85;
      }

      .mt-3 { margin-top: 15px; }
      .mt-2 { margin-top: 10px; }
    </style>

    <!-- === NAVBAR === -->
    <nav class="navbar">
      <span class="navbar-brand">⚙️ Panel del Usuario</span>
      <div class="navbar-buttons">
        <button class="btn-green" id="navUserForm">👤 Datos</button>
        <button class="btn-blue" id="navTipoMina">⛏️ Mina</button>
        <button class="btn-cyan" id="navGeoEmpresa">🌍 Empresa</button>
        <button class="btn-yellow" id="navDevices">🛰️ Dispositivos</button>
        <button class="btn-orange" id="navAlerts">🚨 Alertas</button>
        <button class="btn-green" id="navHistorialCompleto">📜 Historial</button>
        <button class="btn-blue" id="navHistorialManage">🗂️ Manager</button>
        <button class="btn-red" id="navLogout">🔒 Salir</button>
      </div>
    </nav>

    <!-- === CONTENIDO === -->
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card"></div>

      <h3>Editar Datos</h3>
      <form id="editForm" class="card">
        <h4>Datos Personales</h4>
        <label>Nombre:</label><input type="text" id="nombre" />
        <label>Teléfono:</label><input type="text" id="telefono" />
        <label>Dirección:</label><input type="text" id="direccion" />
        <label>ID del Dispositivo:</label><input type="text" id="deviceId" />

        <h4>Tipo de Mina</h4>
        <select id="tipoMina">
          <option value="">Seleccione tipo...</option>
          <option value="subterranea">Subterránea</option>
          <option value="tajo_abierto">Tajo Abierto</option>
          <option value="aluvial">Aluvial</option>
          <option value="cantera">Cantera</option>
          <option value="pirquen">Pirquén</option>
        </select>

        <div id="camposMina"></div>

        <button type="submit" class="btn-green mt-3">💾 Guardar</button>
        <button type="button" id="deleteUser" class="btn-red mt-2">🗑️ Eliminar</button>
      </form>

      <h3>Dispositivo Asignado</h3>
      <div id="deviceData" class="card">Cargando dispositivo...</div>
    </div>
  `;

  // ================================================
  // NAVEGACIÓN SUPERIOR
  // ================================================
  document.getElementById("navUserForm").onclick = () => navigate("userform");
  document.getElementById("navTipoMina").onclick = () => navigate("tipomina");
  document.getElementById("navGeoEmpresa").onclick = () => navigate("geoempresa");
  document.getElementById("navDevices").onclick = () => navigate("devices");
  document.getElementById("navAlerts").onclick = () => navigate("alerts");
  document.getElementById("navHistorialCompleto").onclick = () => navigate("history");
  document.getElementById("navHistorialManage").onclick = () => navigate("manager");
  document.getElementById("navLogout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };

  // ================================================
  // CAMPOS SEGÚN TIPO DE MINA
  // ================================================
  const camposMinaDiv = document.getElementById("camposMina");
  const tipoSelect = document.getElementById("tipoMina");

  function renderCampos(tipo) {
    let html = "";
    switch (tipo) {
      case "subterranea":
        html = `<label>Zona:</label><input id="zona" />
                <label>Rampa:</label><input id="rampa" />
                <label>Galería:</label><input id="galeria" />
                <label>Sector:</label><input id="sector" />`;
        break;
      case "tajo_abierto":
        html = `<label>Banco:</label><input id="banco" />
                <label>Fase:</label><input id="fase" />
                <label>Frente:</label><input id="frente" />`;
        break;
      case "aluvial":
        html = `<label>Mina:</label><input id="mina" />
                <label>Río:</label><input id="rio" />
                <label>Tramo:</label><input id="tramo" />`;
        break;
      case "cantera":
        html = `<label>Cantera:</label><input id="cantera" />
                <label>Material:</label><input id="material" />`;
        break;
      case "pirquen":
        html = `<label>Faena:</label><input id="faena" />
                <label>Tipo de explotación:</label><input id="tipoExplotacion" />`;
        break;
    }
    camposMinaDiv.innerHTML = html;
  }
  tipoSelect.addEventListener("change", e => renderCampos(e.target.value));

  // ================================================
  // CARGA Y GUARDADO DE DATOS
  // ================================================
  onAuthStateChanged(auth, async (user) => {
    if (!user) return (root.innerHTML = "<p>No hay usuario autenticado.</p>");
    const userDoc = doc(firestore, "users", user.uid);

    onSnapshot(userDoc, (snap) => {
      const data = snap.exists() ? snap.data() : {};
      document.getElementById("userProfile").innerHTML = `
        <p><b>Nombre:</b> ${data.nombre || "-"}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Tipo de mina:</b> ${data.tipoMina || "-"}</p>
      `;
      tipoSelect.value = data.tipoMina || "";
      renderCampos(tipoSelect.value);
    });

    document.getElementById("editForm").onsubmit = async (e) => {
      e.preventDefault();
      const tipo = tipoSelect.value;
      const extras = {};
      camposMinaDiv.querySelectorAll("input").forEach(i => extras[i.id] = i.value.trim());
      const updatedData = {
        nombre: document.getElementById("nombre").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        tipoMina: tipo,
        ...extras,
        updatedAt: new Date().toISOString()
      };
      try {
        await setDoc(userDoc, updatedData, { merge: true });
        await update(ref(db, `usuarios/${user.uid}`), updatedData);
        alert("✅ Datos guardados correctamente");
      } catch (err) {
        alert("❌ Error: " + err.message);
      }
    };

    document.getElementById("deleteUser").onclick = async () => {
      if (!confirm("¿Eliminar usuario permanentemente?")) return;
      try {
        await deleteDoc(userDoc);
        await remove(ref(db, `usuarios/${user.uid}`));
        alert("🗑️ Usuario eliminado");
        navigate("login");
      } catch (err) {
        alert("❌ Error al eliminar: " + err.message);
      }
    };
  });
}
