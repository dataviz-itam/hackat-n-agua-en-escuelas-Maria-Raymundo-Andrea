// Esta función determina si un valor está por encima del límite permitido
function valorSobreLimite(parametro, valor) {
    const limites = {
      'Parámetros biológicos y físicos (PBF): COLIFORMES FECALES': '0', // Representa ausencia o no detectables como '0'
      'Parámetros biológicos y físicos (PBF): TURBIEDAD': '4',
      'Parámetros químicos (no metálicos) (PBQ): FLUORUROS': '1.5',
      'Parámetros químicos (no metálicos) (PBQ): NITRATOS': '11',
      'Parámetros químicos (no metálicos) (PBQ): SÓLIDOS DISUELTOS': '1000',
      'Parámetros químicos metálicos (o metaloides) (PBM): ALUMINIO': '0.2',
      'Parámetros químicos metálicos (o metaloides) (PBM): ARSÉNICO': '0.025',
      'Parámetros químicos metálicos (o metaloides) (PBM): HIERRO': '0.3',
      'Parámetros químicos metálicos (o metaloides) (PBM): PLOMO': '0.01',
    };
  
    let limite = limites[parametro];
    if (Array.isArray(limite)) { // Si es un rango
      return valor < limite[0] || valor > limite[1];
    } else {
      return valor > parseFloat(limite);
    }
}
  
// Carga de datos desde el CSV
d3.csv("baseFinal.csv").then(function(data) {
    // Configuración inicial de selectores
    let estados = new Set(data.map(d => d['Nombre de la entidad']));
    d3.select("#state-select")
      .selectAll('option')
      .data([''].concat(Array.from(estados)))
      .enter()
      .append('option')
      .text(d => d);

    // Evento de cambio en el selector de estados
    d3.select("#state-select").on("change", function() {
        let estado = this.value;
        let municipios = new Set(data.filter(d => d['Nombre de la entidad'] === estado).map(d => d['Nombre del municipio o delegación']));
        d3.select("#municipality-select").selectAll('option').remove();
        d3.select("#municipality-select")
          .selectAll('option')
          .data([''].concat(Array.from(municipios)))
          .enter()
          .append('option')
          .text(d => d);
    });

    // Evento de cambio en el selector de municipios
    d3.select("#municipality-select").on("change", function() {
        let municipio = this.value;
        let escuelas = new Set(data.filter(d => d['Nombre del municipio o delegación'] === municipio).map(d => d['Nombre del centro de trabajo']));
        d3.select("#school-select").selectAll('option').remove();
        d3.select("#school-select")
          .selectAll('option')
          .data([''].concat(Array.from(escuelas)))
          .enter()
          .append('option')
          .text(d => d);
    });

    // Evento de cambio en el selector de escuelas
    d3.select("#school-select").on("change", function() {
        let escuela = this.value;
        let datosEscuela = data.filter(d => d['Nombre del centro de trabajo'] === escuela)[0];
        d3.select("#school-data").selectAll("*").remove(); // Limpia datos antiguos

        // Crear y mostrar la tabla vertical
        let columns = Object.keys(datosEscuela).filter(d => !['Nombre de la entidad', 'Nombre del municipio o delegación', 'Nombre del centro de trabajo', 'Período de información'].includes(d));
        let table = d3.select("#school-data").append("table");
        let rows = table.selectAll("tr")
              .data(columns)
              .enter()
              .append("tr");

        rows.append("th")
            .text(d => d);

        rows.append("td")
        .text(d => datosEscuela[d] || "Dato no disponible")
        .attr("class", d => { // Establece la clase según las condiciones
            let valorTexto = datosEscuela[d];
            if (!valorTexto) {
            return "cell-no-data"; // Sin datos en la base de datos
            } else if (valorTexto.toUpperCase() === 'ND') {
            return "cell-within-limits"; // No detectado, considerado como dentro de los límites
            } else {
            let valor = parseFloat(valorTexto);
            if (isNaN(valor)) {
                return "cell-no-data"; // Información no numérica proporcionada
            } else if (valorSobreLimite(d, valor)) {
                return "cell-above-limits"; // Valor por encima del límite
            } else {
                return "cell-within-limits"; // Valor dentro de los límites permisibles
            }
            }
        })
        .attr("title", d => { // Usamos attr en lugar de append para establecer el atributo title
            let valorTexto = datosEscuela[d];
            if (!valorTexto) {
            return "El dato no se encontraba en la base de datos";
        } else if (valorTexto.toUpperCase() === 'ND') {
            return "No se detectó en el análisis";
        } else {
            let valor = parseFloat(valorTexto);
            if (isNaN(valor)) {
                return "Información no numérica proporcionada";
            } else if (valorSobreLimite(d, valor)) {
                return `¡Atención! El valor de ${d} está por encima del límite permisible.`;
            } else {
                return "Dentro del límite permisible";
            }
        }
    });
    });
});

