// /components/TipoMinaForm.js
export function renderTipoMinaForm() {
  return `
    <h4>Tipo de Mina</h4>
    <select id="tipoMina">
      <option value="">Seleccione tipo...</option>
      <option value="subterranea">⛏️ Subterránea</option>
      <option value="tajo_abierto">🪨 Tajo Abierto</option>
      <option value="aluvial">💧 Aluvial</option>
      <option value="cantera">🏗️ Cantera</option>
      <option value="pirquen">🧰 Pirquén / Artesanal</option>
    </select>
    <div id="camposMina"></div>
  `;
}

export function renderCamposMina(tipo) {
  let html = "";
  switch (tipo) {
    case "subterranea":
      html = `
        <h4>⛏️ Subterránea</h4>
        <label>Zona:</label><input id="zona" />
        <label>Rampa:</label><input id="rampa" />
        <label>Galería:</label><input id="galeria" />
        <label>Sector:</label><input id="sector" />
        <label>Estación:</label><input id="nombreEstacion" />
      `;
      break;

    case "tajo_abierto":
      html = `
        <h4>🪨 Tajo Abierto</h4>
        <label>Banco:</label><input id="banco" />
        <label>Fase:</label><input id="fase" />
        <label>Frente:</label><input id="frente" />
        <label>Coordenadas GPS:</label><input id="coordGPS" />
      `;
      break;

    case "aluvial":
      html = `
        <h4>💧 Aluvial</h4>
        <label>Río:</label><input id="rio" />
        <label>Tramo:</label><input id="tramo" />
        <label>Cuadrante:</label><input id="cuadrante" />
      `;
      break;

    case "cantera":
      html = `
        <h4>🏗️ Cantera</h4>
        <label>Material:</label><input id="material" />
        <label>Polígono:</label><input id="poligono" />
      `;
      break;

    case "pirquen":
      html = `
        <h4>🧰 Pirquén</h4>
        <label>Faena:</label><input id="faena" />
        <label>Tipo de explotación:</label><input id="tipoExplotacion" />
        <label>Nivel:</label><input id="nivel" />
      `;
      break;

    default:
      html = "";
  }
  return html;
}
