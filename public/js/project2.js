const margin = {left: 80, right: 20, top: 50, bottom: 100};

const width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const g = d3.select("#chart-area")
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

let time = 0;

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
    .attr('x', width/2)
    .attr('y', height + 50 )
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px');

const yLabel = g.append('text')
    .text('Life Expectancy (Years)')
    .attr('x', -170)
    .attr('y', -40)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px')
    .attr('transform', 'rotate(-90)');

const timeLabel = g.append("text")
    .attr("y", height -10)
    .attr("x", width - 40)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text("1800");

const xAxisCall = d3.axisBottom(xScale)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format('$'));

g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0, ' + height + ')')
    .call(xAxisCall);

const yAxisCall = d3.axisLeft(yScale).tickFormat(d => +d);

g.append('g')
    .attr('class', 'y axis')
    .call(yAxisCall);

d3.json('data/gapminder.json').then((data) => {

    const newData = data.map((yearObject) => {
        const newCountries = yearObject.countries.filter((country) => {
            return country.life_exp !== null && country.income !== null;
        }).map((country) => {
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;
        });

        return {year: yearObject.year, countries: newCountries}
    });

    console.log('new after', newData);

    d3.interval(() => {
        time = (time < 214) ? time+1 : 0;
        update(newData[time].countries);
    }, 100);

    update(newData[0]);
});

function update(data) {
    const t = d3.transition().duration(100);

    const circles = g.selectAll('circle').data(data, d => d.country);

    circles.exit()
        .attr('class', 'exit')
        .remove();

    circles.enter()
        .append('circle')
        .attr('class', 'enter')
        .attr('fill', d => continentColor(d.continent))
        .merge(circles)
        .transition(t)
            .attr('cx', d => xScale(d.income))
            .attr('cy', d => yScale(d.life_exp))
            .attr('r', d => Math.sqrt(area(d.population) / Math.PI));

    timeLabel.text(+(time + 1800))
}