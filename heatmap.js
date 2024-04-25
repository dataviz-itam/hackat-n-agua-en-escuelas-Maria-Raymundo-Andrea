document.addEventListener("DOMContentLoaded", function() {
    const margin = { top: 30, right: 60, bottom: 150, left: 250 },
        width = 980 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.csv("analisisNaN.csv").then(function(data) {
        const myGroups = Object.keys(data[0]).slice(1);
        const myVars = data.map(d => d.Entidad).reverse();

        const x = d3.scaleBand()
            .range([0, width])
            .domain(myGroups)
            .padding(0.05);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        const y = d3.scaleBand()
            .range([height, 0])
            .domain(myVars)
            .padding(0.05);

        svg.append("g")
            .call(d3.axisLeft(y));

        const myColor = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([100, 1]);

        data.forEach(row => {
            myGroups.forEach(group => {
                svg.append("rect")
                    .attr("x", x(group))
                    .attr("y", y(row.Entidad))
                    .attr("width", x.bandwidth())
                    .attr("height", y.bandwidth())
                    .style("fill", myColor(row[group]))
                    .style("opacity", 0.8);
            });
        });

        const legendHeight = 250;
        const legendWidth = 20;

        const legendSvg = svg.append("g")
            .attr("transform", `translate(${width + 12}, ${(height - legendHeight) / 2})`);

        const legendScale = d3.scaleLinear()
            .range([legendHeight, 0])
            .domain([1, 100]);

        const legendAxis = d3.axisRight(legendScale).ticks(10);

        legendSvg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${legendWidth}, 0)`)
            .call(legendAxis);

        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%");

        linearGradient.selectAll("stop") 
        .data([
            {offset: "0%", color: myColor(100)}, 
            {offset: "25%", color: myColor(75)},
            {offset: "50%", color: myColor(50)},
            {offset: "75%", color: myColor(25)},
            {offset: "100%", color: myColor(1)}
        ])
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });

        legendSvg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#gradient)");
    });
});
