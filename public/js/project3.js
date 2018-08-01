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

const xLabel = g.append('text')
    .text('Time')
    .attr('y', height + 60)
    .attr('x', width/2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px');

const yLabel = g.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', -65)
    .attr('x', -height/2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px');

// Time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y");
// For tooltip
const bisectDate = d3.bisector(function(d) { return d.year; }).left;

var formatTime = d3.timeFormat("%d/%m/%Y");

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

// Add line to chart
let line = g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-with", "3px");

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

const lineScale = d3.line();

$("#date-slider").slider({
    range: true,
    max: parseTime('31/10/2017').getTime(),
    min: parseTime('12/05/2013').getTime(),
    step: 1000 * 60 * 60 * 24,
    values: [parseTime("12/5/2013").getTime(), parseTime('31/10/2017').getTime()],
    slide: (event, ui) => {
        $("#dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("#dateLabel2").text(formatTime(new Date(ui.values[1])));
        update();
    }
});

let filteredData = {};
const cryptoKeys = ['bitcoin', 'bitcoin_cash', 'ethereum', 'litecoin', 'ripple'];
let coin = cryptoKeys[0];

d3.json("data/coins.json").then(function(data) {
    // Data cleaning
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
    update();
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

$("#var-select").on("change", e => {
    update()
});

$("#coin-select").on("change", e => {
    coin = cryptoKeys[cryptoKeys.indexOf(e.target.value)];
    update()
});

update = () => {
    const value = $('#var-select').val();
    const sliderValues = $("#date-slider").slider("values");
    const coinData = filteredData[coin].filter(d => d.date >= sliderValues[0] && d.date <= sliderValues[1]);

    const t = d3.transition().duration(500);

    x.domain(d3.extent(coinData, d => d.date ));

    y.domain([d3.min(coinData, d => d[value]) / 1.005,
        d3.max(coinData, d => d[value]) * 1.005]);

    xAxis.transition(t).call(xAxisCall.scale(x));
    yAxis.transition(t).call(yAxisCall.scale(y));

    // Line path generator
    lineScale.x(function(d) { return x(d.date); })
        .y(function(d) { return y(d[value]); });

    line.transition(t).attr("d", lineScale(coinData));

    let text;
    switch (value) {
        case 'price_usd':
            text = 'Price (USD)';
            break;
        case '24h_vol':
            text = '24 Hour Trading Volume';
            break;
        case 'market_cap':
            text = 'Market Cap (USD)';
            break;
        default:
            text = '';
            break;
    }

    yLabel.text(text);
};

