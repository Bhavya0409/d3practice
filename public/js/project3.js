/*
*    project3.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/

const margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;

const svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", "translate(" + margin.left +
        ", " + margin.top + ")");

const t = () => d3.transition().duration(1000);

// Time parser for x-scale
const parseTime = d3.timeParse("%d/%m/%Y");
// For tooltip
const bisectDate = d3.bisector(d => d.date).left;
// Format time into a readable format
const formatTime = d3.timeFormat("%d/%m/%Y");

// Add line to chart
g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey");

const xLabel = g.append('text')
    .text('Time')
    .attr('y', height + 50)
    .attr('x', width/2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px');

const yLabel = g.append('text')
    .attr('class', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('y', -60)
    .attr('x', -height/2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px');

const xScale = d3.scaleTime().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);

const xAxisCall = d3.axisBottom().ticks(4);
const xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

const yAxisCall = d3.axisLeft();
const yAxis = g.append("g")
    .attr("class", "y axis");

$("#var-select").on("change", e => {
    update()
});

$("#coin-select").on("change", e => {
    update();
});

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
    update();

});

update = () => {
    const coin = $("#coin-select").val();
    const value = $('#var-select').val();
    const sliderValues = $("#date-slider").slider("values");
    const coinData = filteredData[coin].filter(d => d.date >= sliderValues[0] && d.date <= sliderValues[1]);

    xScale.domain(d3.extent(coinData, d => d.date ));

    yScale.domain([d3.min(coinData, d => d[value]) / 1.005,
        d3.max(coinData, d => d[value]) * 1.005]);

    // Fix for format values
    const formatSi = d3.format(".2s");
    function formatAbbreviation(x) {
        const s = formatSi(x);
        switch (s[s.length - 1]) {
            case "G": return s.slice(0, -1) + "B";
            case "k": return s.slice(0, -1) + "K";
        }
        return s;
    }

    xAxis.transition(t()).call(xAxisCall.scale(xScale));
    yAxis.transition(t()).call(yAxisCall.scale(yScale).tickFormat(formatAbbreviation));

    /******************************** Tooltip Code ********************************/

    d3.select(".focus").remove();
    d3.select(".overlay").remove();

    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    svg.append("rect")
        .attr("class", "overlay")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", () => { focus.style("display", null); })
        .on("mouseout", () => { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = xScale.invert(d3.mouse(this)[0]),
            i = bisectDate(coinData, x0, 1),
            d0 = coinData[i - 1],
            d1 = coinData[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d[value]) + ")");
        focus.select("text").text(() => d3.format("$,")(d[value].toFixed(2)));
        focus.select(".x-hover-line").attr("y2", height - yScale(d[value]));
        focus.select(".y-hover-line").attr("x2", -xScale(d.date));
    }

    /******************************** Tooltip Code ********************************/

    const lineScale = d3.line().x(d => xScale(d.date))
        .y(d => yScale(d[value]));

    g.select(".line").transition(t).attr("d", lineScale(coinData));

    let text;
    switch (value) {
        case 'price_usd':
            text = 'Price (USD)';
            break;
        case '24h_vol':
            text = '24 Hour Trading Volume (USD)';
            break;
        case 'market_cap':
            text = 'Market Capitalization (USD)';
            break;
        default:
            text = '';
            break;
    }

    yLabel.text(text);
};

