document.addEventListener("DOMContentLoaded", function() {
    const width = 600, height = 600;
    const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);
    const radius = Math.min(width, height) / 2;
    const chartArea = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    function normalizeData(data) {
        const keys = [
            "Parámetros biológicos y físicos (PBF): COLIFORMES FECALES",
            "Parámetros biológicos y físicos (PBF): TURBIEDAD",
            "Parámetros químicos (no metálicos) (PBQ): FLUORUROS",
            "Parámetros químicos (no metálicos) (PBQ): NITRATOS",
            "Parámetros químicos (no metálicos) (PBQ): SÓLIDOS DISUELTOS",
            "Parámetros químicos metálicos (o metaloides) (PBM): ALUMINIO",
            "Parámetros químicos metálicos (o metaloides) (PBM): ARSÉNICO",
            "Parámetros químicos metálicos (o metaloides) (PBM): HIERRO",
            "Parámetros químicos metálicos (o metaloides) (PBM): PLOMO"
        ];
        const scales = {};
    
        keys.forEach(key => {
            const values = data.map(d => +d[key] || 0).filter(v => !isNaN(v)); // Convertir cadenas vacías a 0 y filtrar valores no numéricos
            const min = Math.min(...values);
            const max = Math.max(...values);
            scales[key] = d3.scaleLinear().domain([min, max]).range([0, 1]);
        });
    
        data.forEach(d => {
            keys.forEach(key => {
                d[key] = scales[key](+d[key] || 0); // Asegúrate de manejar cadenas vacías como 0 antes de normalizar
            });
        });
        console.log("Datos normalizados:", data); // Verifica cómo se normalizan los datos (valores entre 0 y 1
        return data;
    }
    

    d3.csv("baseFinal.csv").then(rawData => {
        console.log("Datos crudos:", rawData); // Verifica cómo se cargan los datos crudos
        const data = normalizeData(rawData);
        const entidades = Array.from(new Set(data.map(d => d["Nombre de la entidad"])));
        updateSelect("#selectEntidad", entidades);

        document.getElementById("selectEntidad").addEventListener("change", function() {
            const selectedEntidad = this.value;
            const municipios = Array.from(new Set(data.filter(d => d["Nombre de la entidad"] === selectedEntidad).map(d => d["Nombre del municipio o delegación"])));
            updateSelect("#selectMunicipio", municipios);
        });

        document.getElementById("selectMunicipio").addEventListener("change", function() {
            const selectedMunicipio = this.value;
            const escuelas = data.filter(d => d["Nombre del municipio o delegación"] === selectedMunicipio);
            updateSelect("#selectEscuela", escuelas.map(d => d["Nombre del centro de trabajo"]));
        });

        document.getElementById("selectEscuela").addEventListener("change", function() {
            const selectedEscuela = this.value;
            const escuelaData = data.find(d => d["Nombre del centro de trabajo"] === selectedEscuela);
            console.log("Datos de la escuela seleccionada:", escuelaData); // Verifica los datos específicos de la escuela
            drawRadarChart(chartArea, escuelaData, radius);
        });

        function updateSelect(selector, options) {
            const select = d3.select(selector);
            select.selectAll("option").remove();
            select.selectAll("option")
                .data(options)
                .enter().append("option")
                .text(d => d);
        }

        function drawRadarChart(chartArea, data, radius) {
            const keys = [
                "Parámetros biológicos y físicos (PBF): COLIFORMES FECALES",
                "Parámetros biológicos y físicos (PBF): TURBIEDAD",
                "Parámetros químicos (no metálicos) (PBQ): FLUORUROS",
                "Parámetros químicos (no metálicos) (PBQ): NITRATOS",
                "Parámetros químicos (no metálicos) (PBQ): SÓLIDOS DISUELTOS",
                "Parámetros químicos metálicos (o metaloides) (PBM): PLOMO"
            ];
            const angleSlice = Math.PI * 2 / keys.length;
            const scale = d3.scaleLinear().domain([0, 1]).range([0, radius]);
        
            const tooltip = d3.select("#tooltip");
        
            // Draw the radar chart axes and handle mouse events
            const axes = chartArea.selectAll(".axis")
                .data(keys)
                .enter().append("g")
                .attr("class", "axis");
        
            axes.append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", (d, i) => Math.cos(angleSlice * i - Math.PI / 2) * scale(data[keys[i]] || 0))
                .attr("y2", (d, i) => Math.sin(angleSlice * i - Math.PI / 2) * scale(data[keys[i]] || 0))
                .attr("stroke", "black")
                .on("mouseover", function(event, d) {
                    tooltip.style("display", "block")
                           .style("left", (event.pageX + 10) + "px")
                           .style("top", (event.pageY + 10) + "px")
                           .html("Key: " + d + "<br>Value: " + (data[d] || 0));
                })
                .on("mouseout", function() {
                    tooltip.style("display", "none");
                });
        
            // Rest of your drawing code for the radar chart...
        }
        
        function drawRadarChart(chartArea, data, radius) {
            const keys = [
                "Parámetros biológicos y físicos (PBF): COLIFORMES FECALES",
                "Parámetros biológicos y físicos (PBF): TURBIEDAD",
                "Parámetros químicos (no metálicos) (PBQ): FLUORUROS",
                "Parámetros químicos (no metálicos) (PBQ): NITRATOS",
                "Parámetros químicos (no metálicos) (PBQ): SÓLIDOS DISUELTOS",
                "Parámetros químicos metálicos (o metaloides) (PBM): ALUMINIO",
                "Parámetros químicos metálicos (o metaloides) (PBM): ARSÉNICO",
                "Parámetros químicos metálicos (o metaloides) (PBM): HIERRO",
                "Parámetros químicos metálicos (o metaloides) (PBM): PLOMO"
            ];
            const angleSlice = Math.PI * 2 / keys.length;
            const scale = d3.scaleLinear()
            .domain([0, 1])
            .range([radius*0.01, radius]); // Esto asegura que incluso el valor 0 se mapee a un radio no nulo
                
            const radarData = keys.map(key => ({value: parseFloat(data[key]) || 0}));
            console.log("Datos para el gráfico radial:", radarData);
        
            // Draw the radar chart axes
            chartArea.selectAll(".axis")
                .data(keys)
                .enter().append("g")
                .attr("class", "axis")
                .append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", (d, i) => Math.cos(angleSlice * i - Math.PI / 2) * radius)
                .attr("y2", (d, i) => Math.sin(angleSlice * i - Math.PI / 2) * radius)
                .attr("stroke", "black");
        
            // Draw the radar chart area
            const radarLine = d3.lineRadial()
                .angle((d, i) => i * angleSlice)
                .radius(d => scale(d.value))
                .curve(d3.curveLinearClosed);
        
            chartArea.selectAll(".radarArea")
                .data([radarData])
                .join("path")
                .attr("class", "radarArea")
                .attr("d", radarLine)
                .style("fill", "orange")
                .style("fill-opacity", 1);
        }        
    });
});
