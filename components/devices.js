// ================================================
// IMPORTACIONES Y CONFIGURACIÓN
// ================================================
import {
  auth, db, firestore, ref, onValue, get, remove, onAuthStateChanged
} from "../firebaseConfig.js";

import { doc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { navigate } from "../app.js";
import { showHistoryUtilsPage } from "./historyUtils.js";
import { showNewHistoryPage } from "./Histors.js";
import { showPagina1, showPagina2 } from "./paginas.js";
import { showHistoryManagerPage } from "./historyManager.js";

// ================================================
// NAV / MENÚ PRINCIPAL
// ================================================
export function showNav() {
  const navRoot = document.getElementById("nav");
  if(!navRoot) return console.error("No existe el contenedor #nav en el HTML");
  navRoot.innerHTML = `
    <nav class="navbar">
      <button id="btnAdmin">🏠 Dashboard Admin</button>
      <button id="btnUser">👤 Perfil Usuario</button>
      <button id="btnDevices">📱 Dispositivos</button>
      <button id="btnAlerts">⚠️ Alertas</button>
      <button id="btnHistory">📜 Historial General</button>
      <button id="btnLogout">🔓 Cerrar Sesión</button>
    </nav>
  `;

  // Event listeners
  document.getElementById("btnAdmin").onclick = () => navigate("admin");
  document.getElementById("btnUser").onclick = () => navigate("user");
  document.getElementById("btnDevices").onclick = () => navigate("devices");
  document.getElementById("btnAlerts").onclick = () => navigate("alerts");
  document.getElementById("btnHistory").onclick = () => showHistoryUtilsPage();
  document.getElementById("btnLogout").onclick = async () => {
    await auth.signOut();
    navigate("login");
  };
}

// ================================================
// FUNCIONES AUXILIARES PARA INICIAR NAV AL CARGAR
// ================================================
export function initNav() {
  showNav(); // Siempre mostrar nav al inicio
}

// ================================================
// PANEL ADMINISTRADOR
// ================================================
export function showAdminDashboard() {
  showNav(); // asegurar nav
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Panel del Administrador</h2>
      <div id="users"></div>
      <div class="actions">
        <button id="historyBtn">📜 Historial General</button>
        <button id="nuevoBtnAdmin">✨ Nuevo Botón</button>
        <button id="pagina1Btn">📄 Página 1</button>
        <button id="pagina2Btn">📄 Página 2</button>
        <button id="logout">Cerrar Sesión</button>
      </div>
    </div>
  `;

  const usersRef = ref(db, "usuarios");
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val() || {};
    const container = document.getElementById("users");
    container.innerHTML = "<h3>Usuarios Registrados:</h3>";
    for (let id in data) {
      const user = data[id];
      const rolTexto = user.isAdmin ? "Administrador" : "Usuario Normal";
      container.innerHTML += `<p>👤 ${user.nombre || "Sin nombre"} (${user.email}) - <b>${rolTexto}</b></p>`;
    }
  });

  document.getElementById("logout").onclick = async () => { 
    await auth.signOut(); 
    navigate("login"); 
  };
  document.getElementById("historyBtn").onclick = () => showHistoryUtilsPage();
  document.getElementById("nuevoBtnAdmin").onclick = () => showNewHistoryPage();
  document.getElementById("pagina1Btn").onclick = () => showPagina1();
  document.getElementById("pagina2Btn").onclick = () => showPagina2();
}

// ================================================
// DASHBOARD USUARIO
// ================================================
export function showUserDashboard() {
  showNav(); // asegurar nav
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Perfil del Usuario</h2>
      <div id="userProfile" class="card">Cargando datos...</div>
      <form id="editForm">
        <label>Nombre: <input type="text" id="nombre"></label>
        <label>Teléfono: <input type="text" id="telefono"></label>
        <label>Dirección: <input type="text" id="direccion"></label>
        <label>ID del Dispositivo: <input type="text" id="deviceId"></label>
        <div id="camposMinaDinamicos"></div>
        <button type="submit">Guardar Cambios</button>
      </form>
      <button id="deleteUser">Eliminar Usuario</button>
      <div id="deviceData"></div>
    </div>
  `;

  const tipoMinaSelect = document.getElementById("tipoMina");
  const camposMinaDiv = document.getElementById("camposMinaDinamicos");
  tipoMinaSelect?.addEventListener("change", () => {
    const tipo = tipoMinaSelect.value;
    let html = "";
    switch(tipo){
      case "subterranea":
        html = `<label>Zona:</label><input type="text" id="zona" />
                <label>Rampa:</label><input type="text" id="rampa" />
                <label>Galería:</label><input type="text" id="galeria" />
                <label>Sector:</label><input type="text" id="sector" />
                <label>Nombre de estación:</label><input type="text" id="nombreEstacion" />`;
        break;
      case "tajo_abierto":
        html = `<label>Banco:</label><input type="text" id="banco" />
                <label>Frente:</label><input type="text" id="frente" />
                <label>Zona:</label><input type="text" id="zona" />
                <label>Sector:</label><input type="text" id="sector" />`;
        break;
      case "aluvial":
        html = `<label>Mina:</label><input type="text" id="mina" />
                <label>Río:</label><input type="text" id="rio" />
                <label>Cuadrante:</label><input type="text" id="cuadrante" />`;
        break;
      case "cantera":
        html = `<label>Cantera:</label><input type="text" id="cantera" />
                <label>Material:</label><input type="text" id="material" />
                <label>Frente:</label><input type="text" id="frente" />`;
        break;
      case "pirqen":
        html = `<label>Faena:</label><input type="text" id="faena" />
                <label>Tipo de explotación:</label><input type="text" id="tipoExplotacion" />
                <label>Sector:</label><input type="text" id="sector" />
                <label>Nivel:</label><input type="text" id="nivel" />`;
        break;
    }
    camposMinaDiv.innerHTML = html;
  });

  onAuthStateChanged(auth, async (user) => {
    if(!user) return root.innerHTML="<p>No hay usuario autenticado.</p>";
    const userId = user.uid;
    const userEmail = user.email;
    const userDocRef = doc(firestore,"users",userId);

    onSnapshot(userDocRef,(docSnap)=>{
      const data = docSnap.exists()?docSnap.data():{};
      document.getElementById("userProfile").innerHTML=`
        <p><b>Nombre:</b> ${data.nombre||"No registrado"}</p>
        <p><b>Correo:</b> ${userEmail}</p>
        <p><b>Teléfono:</b> ${data.telefono||"-"}</p>
        <p><b>Dirección:</b> ${data.direccion||"-"}</p>
        <p><b>ID del Dispositivo:</b> ${data.deviceId||"No asignado"}</p>
      `;
      ["nombre","telefono","direccion","deviceId","latitude","longitude","altitude",
       "precision","EPSG","pais","region","comuna","nombreEmpresa"].forEach(f=>{
        const el=document.getElementById(f);
        if(el) el.value=data[f]||"";
      });
      if(data.deviceId) mostrarDatosDispositivo(data.deviceId);
    });

    document.getElementById("editForm").addEventListener("submit", async e=>{
      e.preventDefault();
      const newData={};
      ["nombre","telefono","direccion","deviceId","latitude","longitude","altitude",
       "precision","EPSG","pais","region","comuna","nombreEmpresa"].forEach(f=>{
        const el=document.getElementById(f);
        if(el) newData[f]=el.value.trim();
      });
      newData.email=userEmail;
      newData.updatedAt=new Date().toISOString();
      try{
        await setDoc(doc(firestore,"users",userId),newData,{merge:true});
        await update(ref(db,`usuarios/${userId}`),newData);
        alert("✅ Datos actualizados correctamente.");
      }catch(err){console.error(err);alert(`❌ Error al guardar: ${err.message}`);}
    });

    document.getElementById("deleteUser").onclick=async ()=>{
      if(!confirm("¿Seguro que deseas borrar este usuario?")) return;
      try{
        await deleteDoc(doc(firestore,"users",userId));
        await remove(ref(db,`usuarios/${userId}`));
        alert("🗑️ Usuario eliminado correctamente.");
        navigate("login");
      }catch(err){console.error(err);alert(`❌ No se pudo borrar el usuario: ${err.message}`);}
    };
  });
}

// ================================================
// FUNCIONES DE DISPOSITIVOS E HISTORIALES
// ================================================
function mostrarDatosDispositivo(deviceId, container=document.getElementById("deviceData")){
  const deviceRef = ref(db,`dispositivos/${deviceId}`);
  onValue(deviceRef,(snapshot)=>{
    const d = snapshot.val();
    if(!d) return container.innerHTML=`<p>No se encontró el dispositivo: <b>${deviceId}</b></p>`;
    container.innerHTML=`
      <p><b>ID:</b> ${deviceId}</p>
      <p><b>Nombre:</b> ${d.name||"Desconocido"}</p>
      <p>CO: ${d.CO??0} ppm</p>
      <p>CO₂: ${d.CO2??0} ppm</p>
      <p>PM10: ${d.PM10??0} µg/m³</p>
      <p>PM2.5: ${d.PM2_5??0} µg/m³</p>
      <p>Humedad: ${d.humedad??0}%</p>
      <p>Temperatura: ${d.temperatura??0} °C</p>
      <div id="historialCarrusel">Cargando...</div>
      <button id="verHistorialBtn2">📜 Ver historial completo</button>
    `;
    mostrarHistorialCarrusel(deviceId);
    document.getElementById("verHistorialBtn2").onclick=()=>showHistoricalPage(deviceId);
  });
}

function mostrarHistorialCarrusel(deviceId){
  const historialRef = ref(db,`dispositivos/${deviceId}/historial`);
  onValue(historialRef,(snapshot)=>{
    const historial = snapshot.val();
    const carrusel = document.getElementById("historialCarrusel");
    carrusel.innerHTML="";
    if(!historial) return carrusel.innerHTML="<p>No hay datos históricos.</p>";
    Object.entries(historial)
      .sort((a,b)=>parseInt(b[0])-parseInt(a[0]))
      .slice(0,12)
      .forEach(([ts,datos])=>{
        const card=document.createElement("div");
        card.className="historialCard";
        card.innerHTML=`
          <p><b>${new Date(parseInt(ts)).toLocaleString()}</b></p>
          <p>CO: ${datos.CO??"—"} ppm</p>
          <p>CO₂: ${datos.CO2??"—"} ppm</p>
          <p>PM10: ${datos.PM10??"—"} µg/m³</p>
          <p>PM2.5: ${datos.PM2_5??"—"} µg/m³</p>
          <p>Humedad: ${datos.humedad??"—"}%</p>
          <p>Temperatura: ${datos.temperatura??"—"} °C</p>
        `;
        carrusel.appendChild(card);
      });
  });
}

// ================================================
// TODOS LOS DISPOSITIVOS
// ================================================
export function showAllDevices(){
  const root = document.getElementById("root");
  root.innerHTML=`
    <div class="dashboard">
      <h2>Todos los Dispositivos</h2>
      <div id="deviceList">Cargando dispositivos...</div>
      <button id="backBtn">Volver</button>
    </div>
  `;
  document.getElementById("backBtn").onclick=()=>navigate("user");
  const devicesRef = ref(db,"dispositivos");
  onValue(devicesRef,(snapshot)=>{
    const devices = snapshot.val();
    const listDiv = document.getElementById("deviceList");
    if(!devices) return listDiv.innerHTML="<p>No hay dispositivos en la base de datos.</p>";
    listDiv.innerHTML="<ul>";
    for(const id in devices){
      const name = devices[id].name||`Dispositivo ${id}`;
      listDiv.innerHTML+=`<li>${name} (ID: ${id}) 
        <button onclick="showHistoricalPage('${id}')">📜 Ver historial</button>
      </li>`;
    }
    listDiv.innerHTML+="</ul>";
  });
}

// ================================================
// HISTORIAL COMPLETO Y EXPORTACIÓN EXCEL
// ================================================
export function showHistoricalPage(deviceId) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="dashboard">
      <h2>Historial Completo del Dispositivo</h2>
      <p><b>ID:</b> ${deviceId}</p>
      <div class="actions">
        <button id="exportExcelBtn" disabled>💾 Exportar a Excel</button>
        <button id="backToDeviceBtn">Volver</button>
      </div>
      <h3>Historial del dispositivo</h3>
      <div id="historialContainer" class="historialGrid">Cargando historial...</div>
      <h3>Historial global</h3>
      <div id="historialGlobalContainer" class="historialGrid">Cargando historial global...</div>
    </div>
  `;

  document.getElementById("backToDeviceBtn").onclick = ()=>navigate("devices");

  const historialRef = ref(db,`dispositivos/${deviceId}/historial`);
  onValue(historialRef,(snapshot)=>{
    const historial = snapshot.val()||{};
    const container = document.getElementById("historialContainer");
    container.innerHTML="";
    Object.entries(historial)
      .sort((a,b)=>parseInt(b[0])-parseInt(a[0]))
      .forEach(([ts,data])=>{
        const card = document.createElement("div");
        card.className="historialCard";
        card.innerHTML = `
          <p><b>${new Date(parseInt(ts)).toLocaleString()}</b></p>
          <p>CO: ${data.CO??"—"} ppm</p>
          <p>CO₂: ${data.CO2??"—"} ppm</p>
          <p>PM10: ${data.PM10??"—"} µg/m³</p>
          <p>PM2.5: ${data.PM2_5??"—"} µg/m³</p>
          <p>Humedad: ${data.humedad??"—"}%</p>
          <p>Temperatura: ${data.temperatura??"—"} °C</p>
        `;
        container.appendChild(card);
      });
    document.getElementById("exportExcelBtn").disabled = Object.keys(historial).length===0;
    document.getElementById("exportExcelBtn").onclick = () => exportToExcel(deviceId, historial);
  });
}
// ================================================
// FUNCIONES AUXILIARES: EXPORTAR HISTORIAL A EXCEL MULTIHOJA
// ================================================
async function exportToExcelMultiSheet(deviceId, registrosLocal, registrosGlobal) {
  // Obtener email del usuario asignado
  let userEmail = "Sin asignar";
  try {
    const snapshot = await get(ref(db, "usuarios"));
    const usuarios = snapshot.val() || {};
    for (let uid in usuarios) {
      if (usuarios[uid].deviceId === deviceId) {
        userEmail = usuarios[uid].email || userEmail;
        break;
      }
    }
  } catch (err) {
    console.error("Error al obtener usuario:", err);
  }

  // Crear arrays de datos para hojas
  const hojaLocal = [["Fecha", "CO", "CO2", "PM10", "PM2.5", "Humedad", "Temperatura", "Usuario", "Dispositivo"]];
  registrosLocal.forEach(([ts, valores]) => {
    hojaLocal.push([
      new Date(parseInt(ts)).toLocaleString("es-CL"),
      valores.CO ?? "",
      valores.CO2 ?? "",
      valores.PM10 ?? "",
      valores.PM2_5 ?? "",
      valores.humedad ?? "",
      valores.temperatura ?? "",
      userEmail,
      deviceId
    ]);
  });

  const hojaGlobal = [["Fecha", "CO", "CO2", "PM10", "PM2.5", "Humedad", "Temperatura", "Usuario", "Dispositivo"]];
  registrosGlobal.forEach(([ts, valores]) => {
    hojaGlobal.push([
      new Date(parseInt(ts)).toLocaleString("es-CL"),
      valores.CO ?? "",
      valores.CO2 ?? "",
      valores.PM10 ?? "",
      valores.PM2_5 ?? "",
      valores.humedad ?? "",
      valores.temperatura ?? "",
      userEmail,
      deviceId
    ]);
  });

  // Crear libro de Excel
  const wb = XLSX.utils.book_new();
  const wsLocal = XLSX.utils.aoa_to_sheet(hojaLocal);
  const wsGlobal = XLSX.utils.aoa_to_sheet(hojaGlobal);
  XLSX.utils.book_append_sheet(wb, wsLocal, "Historial Local");
  XLSX.utils.book_append_sheet(wb, wsGlobal, "Historial Global");

  // Descargar Excel
  XLSX.writeFile(wb, `historial_${deviceId}.xlsx`);
}
