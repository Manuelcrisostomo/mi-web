// ================================================
// TipoMinaForm.js — Formulario dinámico por tipo de mina
// ================================================
export function renderTipoMinaForm() {
  return `
    <section class="form-section">
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
    </section>
  `;
}

export function renderCamposMina(tipo) {
  switch (tipo) {
    case "subterranea":
      return `
        <section class="form-section">
          <h4>⛏️ Subterránea</h4>
          <label>Zona:</label><input id="zona" placeholder="Zona" />
          <label>Rampa:</label><input id="rampa" placeholder="Rampa" />
          <label>Galería:</label><input id="galeria" placeholder="Galería" />
          <label>Sector:</label><input id="sector" placeholder="Sector" />
          <label>Nombre de estación:</label><input id="nombreEstacion" placeholder="Nombre estación" />
        </section>`;
    case "tajo_abierto":
      return `
        <section class="form-section">
          <h4>🪨 Tajo Abierto</h4>
          <label>Banco:</label><input id="banco" placeholder="Banco" />
          <label>Fase:</label><input id="fase" placeholder="Fase" />
          <label>Frente:</label><input id="frente" placeholder="Frente" />
          <label>Coordenadas GPS:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
        </section>`;
    case "aluvial":
      return `
        <section class="form-section">
          <h4>💧 Aluvial (placer)</h4>
          <label>Mina:</label><input id="mina" placeholder="Mina" />
          <label>Río:</label><input id="rio" placeholder="Río" />
          <label>Tramo:</label><input id="tramo" placeholder="Tramo" />
          <label>Cuadrante:</label><input id="cuadrante" placeholder="Cuadrante" />
          <label>Coordenadas GPS:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
        </section>`;
    case "cantera":
      return `
        <section class="form-section">
          <h4>🏗️ Cantera</h4>
          <label>Cantera:</label><input id="cantera" placeholder="Cantera" />
          <label>Material:</label><input id="material" placeholder="Material" />
          <label>Frente:</label><input id="frente" placeholder="Frente" />
          <label>Coordenadas GPS:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
          <label>Polígono:</label><input id="poligono" placeholder="Polígono" />
        </section>`;
    case "pirquen":
      return `
        <section class="form-section">
          <h4>🧰 Pirquén / Artesanal</h4>
          <label>Faena:</label><input id="faena" placeholder="Faena" />
          <label>Tipo de explotación:</label><input id="tipoExplotacion" placeholder="Tipo de explotación" />
          <label>Sector:</label><input id="sector" placeholder="Sector" />
          <label>Coordenadas:</label><input id="coordGPS" placeholder="Ej: -23.45, -70.12" />
          <label>Nivel (si aplica):</label><input id="nivel" placeholder="Nivel" />
        </section>`;
    default:
      return "";
  }
}
