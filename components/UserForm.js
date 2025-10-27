// /components/UserForm.js
export function renderUserForm() {
  return `
    <h4>Datos Personales</h4>
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
  `;
}
