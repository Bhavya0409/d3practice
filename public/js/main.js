/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.4 - Adding SVGs with D3
*/

var margin = {left: 100, right: 10, top: 10, bottom: 10};

var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

d3.json("data/buildings.json").then(function(data) {

    data.forEach(d => {
        d.height = +d.height;
    });

    var x = d3.scaleBand()
        .domain(data.map(function(d) {
            return d.name;
        }))
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
            return d.height;
        })])
        .range([0, height]);

    const rectangles = g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            return x(d.name);
        })
        .attr("y", 20)
        .attr("width", x.bandwidth())
        .attr("height", function(d) {
            return y(d.height)
        })
        .attr("fill", "grey");
}).catch(function(error) {
    console.log(error);
});