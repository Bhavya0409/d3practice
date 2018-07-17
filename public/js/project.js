var margin = { left: 80, right: 20, top: 50, bottom: 100 };

var width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const g = d3.select("#chart-area")
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

const xLabel = g.append('text')
    .text('Month')
    .attr('x', width/2)
    .attr('y', height + 50)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px');

const yLabel = g.append('text')
    .text('Revenue')
    .attr('x', -height/2)
    .attr('y', '-60')
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px')
    .attr('transform', 'rotate(-90)');

d3.json("data/revenues.json").then(function(data) {
    data.forEach(function(d) {
        d.revenue = +d.revenue
    });

    const xScale = d3.scaleBand()
        .domain(data.map(function(d) { return d.month; }))
        .range([0, width])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.revenue;
        })])
        .range([height, 0]);

    const xAxisCall = d3.axisBottom(xScale);

    const yAxisCall = d3.axisLeft(yScale);

    g.append('g')
        .attr('class', 'x-axis-label')
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxisCall)
        .selectAll("text")
        .attr('font-size', '12px');

    g.append('g')
        .attr('class', 'y-axis-label')
        .call(yAxisCall);

    g.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function(d) {
            return xScale(d.month);
        }).attr('y', function (d) {
            return yScale(d.revenue)
        })
        .attr('width', xScale.bandwidth)
        .attr('height', function (d) {
            return height - yScale(d.revenue)
        })
        .attr('fill', 'grey')
});