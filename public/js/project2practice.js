const margin = {left: 80, right: 20, top: 50, bottom: 100};

const width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

let time = 0;

const g = d3.select('#chart-area')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

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

d3.json('data/gapminder.json').then(data => {
    const formattedData = data.map(yearObject => {
        return yearObject.countries.filter(country => {
            return country.income && country.life_exp;
        }).map(country => {
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;
        })
    });

    d3.interval(() => {
        time++;
        if (time === 214) time = 0;
        update(formattedData[time]);
    }, 100);

    update(formattedData[0])
});

update = (data) => {
    const t = d3.transition().duration(100);

    const circles = g.selectAll('circle').data(data, d => d.country);

    circles.exit().remove();

    circles.enter()
        .append('circle')
        .attr('fill', d => continentColor(d.continent))
        .merge(circles)
        .transition(t)
            .attr('cx', d => xScale(d.income))
            .attr('cy', d => yScale(d.life_exp))
            .attr('r', d => Math.sqrt(area(d.population) / Math.PI));

    timeLabel.text(1800 + time);
};

// NOTE: This is just a redo of project 2 for practice