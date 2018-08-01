/*
*    project3.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/

const margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;

const svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", "translate(" + margin.left +
        ", " + margin.top + ")");

// Time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y");
// For tooltip
const bisectDate = d3.bisector(function(d) { return d.year; }).left;

// Axis generators
const xAxisCall = d3.axisBottom();
const yAxisCall = d3.axisLeft()
    .ticks(6)
    .tickFormat(function(d) { return parseInt(d / 1000) + "k"; });

// Axis groups
const xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
const yAxis = g.append("g")
    .attr("class", "y axis");

// Y-Axis label
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .attr("fill", "#5D6971")
    .text("Population)");

d3.json("data/coins.json").then(function(data) {
    // Data cleaning
    const cryptoKeys = ['bitcoin', 'bitcoin_cash', 'ethereum', 'litecoin', 'ripple'];
    let filteredData = {};
    cryptoKeys.forEach(cryptoKey => {
        filteredData[cryptoKey] = data[cryptoKey].filter(d => d.price_usd !== null);

        filteredData[cryptoKey].forEach(d => {
            d['24h_vol'] = +d['24h_vol'];
            d['date'] = parseTime(d['date']);
            d['market_cap'] = +d['market_cap'];
            d['price_usd'] = +d['price_usd'];
        })
    });
    console.log('new data', filteredData);
    //TODO wire up with dropdown selector
    const coin = cryptoKeys[0];

    // Scales
    const x = d3.scaleTime()
        .range([0, width])
        .domain(d3.extent(filteredData[coin], d => d.date ));
    const min = d3.min(filteredData[coin],d => d.price_usd) / 1.005;
    const max = d3.max(filteredData[coin], d => d.price_usd) * 1.005;
    console.log('here', min, max)
    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([min, max]);

    // Generate axes once scales have been set
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));

    // Line path generator
    const line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.price_usd); });

    // Add line to chart
    g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-with", "3px")
        .attr("d", line(filteredData[coin]));

    /******************************** Tooltip Code ********************************/

    // var focus = g.append("g")
    //     .attr("class", "focus")
    //     .style("display", "none");
    //
    // focus.append("line")
    //     .attr("class", "x-hover-line hover-line")
    //     .attr("y1", 0)
    //     .attr("y2", height);
    //
    // focus.append("line")
    //     .attr("class", "y-hover-line hover-line")
    //     .attr("x1", 0)
    //     .attr("x2", width);
    //
    // focus.append("circle")
    //     .attr("r", 7.5);
    //
    // focus.append("text")
    //     .attr("x", 15)
    //     .attr("dy", ".31em");
    //
    // g.append("rect")
    //     .attr("class", "overlay")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .on("mouseover", function() { focus.style("display", null); })
    //     .on("mouseout", function() { focus.style("display", "none"); })
    //     .on("mousemove", mousemove);
    //
    // function mousemove() {
    //     var x0 = x.invert(d3.mouse(this)[0]),
    //         i = bisectDate(data, x0, 1),
    //         d0 = data[i - 1],
    //         d1 = data[i],
    //         d = x0 - d0.year > d1.year - x0 ? d1 : d0;
    //     focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
    //     focus.select("text").text(d.value);
    //     focus.select(".x-hover-line").attr("y2", height - y(d.value));
    //     focus.select(".y-hover-line").attr("x2", -x(d.year));
    // }


    /******************************** Tooltip Code ********************************/

});

