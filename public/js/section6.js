const margin = {left: 80, right: 20, top: 50, bottom: 100};

const width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

let time = 0;
let interval;
let formattedData;

const g = d3.select('#chart-area')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

const tip = d3.tip()
    .attr('class', 'd3-tip').html(d => {
        let text = '<strong>Country:</strong> <span style="color: red">' + d.country + '</span><br/>';
        text += '<strong>Continent:</strong> <span style="color: red; text-transform: capitalize">' + d.continent + '</span><br/>';
        text += '<strong>Life Expectancy:</strong> <span style="color: red">' + d3.format(".2f")(d.life_exp) + '</span><br/>';
        text += '<strong>GDP Per Capita:</strong> <span style="color: red">' + d3.format("$,.0f")(d.income) + '</span><br/>';
        text += '<strong>Population:</strong> <span style="color: red">' + d3.format(",.0f")(d.population) + '</span><br/>';
        return text;
    });

g.call(tip);

const xScale = d3.scaleLog()
    .base(10)
    .domain([300, 150000])
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, 90])
    .range([height, 0]);

const area = d3.scaleLinear()
    .domain([2000, 1400000000])
    .range([25*Math.PI, 1500*Math.PI]);

const continentColor = d3.scaleOrdinal(d3.schemePastel1);

const xLabel = g.append('text')
    .text('GDP Per Capita ($)')
    .attr('y', height + 60)
    .attr('x', width/2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px');

const yLabel = g.append('text')
    .text('Life Expectancy (Years)')
    .attr('transform', 'rotate(-90)')
    .attr('y', -30)
    .attr('x', -height/2)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px');

const timeLabel = g.append('text')
    .text('1800')
    .attr('y', height - 10)
    .attr('x', width - 40)
    .attr('font-size', '40px')
    .attr('text-anchor', 'middle')
    .attr('opacity', '0.4');

const xAxisCall = d3.axisBottom(xScale)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format('$'));

g.append('g')
    .attr('transform', 'translate(0, ' + height + ')')
    .call(xAxisCall);

const yAxisCall = d3.axisLeft(yScale).tickFormat(d => +d);

g.append('g').call(yAxisCall);

const continents = ["europe", "asia", "america", "africa"];

const legend = g.append('g')
    .attr('transform', 'translate(' + (width - 10) + ', ' + (height - 125) + ')');

continents.forEach((continent, i) => {
    const legendRow = legend.append('g')
        .attr('transform', 'translate(0, ' + (i * 20) + ')');

    legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', continentColor(continent));

    legendRow.append('text')
        .attr('x', -10)
        .attr('y', 10)
        .attr('text-anchor', 'end')
        .style('text-transform', 'capitalize')
        .text(continent)
});

d3.json('data/gapminder.json').then(data => {
    formattedData = data.map(yearObject => {
        return yearObject.countries.filter(country => {
            return country.income && country.life_exp;
        }).map(country => {
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;
        })
    });

    update(formattedData[0])
});

$("#play-button").on("click", function() {
    const button = $(this);
    if (button.text() === "Play") {
        button.text("Pause");
        interval = setInterval(step, 100);
    } else {
        button.text("Play");
        clearInterval(interval);
    }
});

$("#reset-button").on("click", function() {
    time = 0;
    update(formattedData[0]);
});

$("#continent-select").on("change", () => {
    update(formattedData[time])
});

$("#date-slider").slider({
    max: 2014,
    min: 1800,
    step: 1,
    slide: function(event, ui) {
        time = ui.value - 1800;
        update(formattedData[time]);
    }
});

step = () => {
    time++;
    if (time === 214) time = 0;
    update(formattedData[time]);
};

update = (data) => {
    const t = d3.transition().duration(100);

    const continent = $('#continent-select').val();

    const filteredData = data.filter((d) => {
        if (continent === 'all') {
            return true;
        } else {
            return d.continent === continent;
        }
    });

    const circles = g.selectAll('circle').data(filteredData, d => d.country);

    circles.exit().remove();

    circles.enter()
        .append('circle')
        .attr('fill', d => continentColor(d.continent))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .merge(circles)
        .transition(t)
            .attr('cx', d => xScale(d.income))
            .attr('cy', d => yScale(d.life_exp))
            .attr('r', d => Math.sqrt(area(d.population) / Math.PI));

    timeLabel.text(1800 + time);
    $("#year")[0].innerHTML = +(time + 1800);

    $("#date-slider").slider("value", +(time + 1800));
};

// NOTE: This is just a redo of project 2 for practice