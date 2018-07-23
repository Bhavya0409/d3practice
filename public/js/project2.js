const margin = {left: 80, right: 20, top: 50, bottom: 100};

const width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const t = d3.transition().duration(750);

const g = d3.select("#chart-area")
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

const xAxisGroup = g.append('g')
    .attr('class', 'x-axis-label')
    .attr('transform', 'translate(0, ' + height + ')');

const yAxisGroup = g.append('g')
    .attr('class', 'y-axis-label');

const xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.2);

const yScale = d3.scaleLinear()
    .range([height, 0]);

const xLabel = g.append('text')
    .text('GDP Per Capita ($)')
    .attr('x', width/2)
    .attr('y', height + 50 )
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px');

const yLabel = g.append('text')
    .text('Life Expectancy (Years)')
    .attr('x', -height/2)
    .attr('y', -60)
    .attr('text-anchor', 'middle')
    .attr('font-size', '20px')
    .attr('transform', 'rotate(-90)');

d3.json('data/gapminder.json').then((data) => {

    console.log('here', data);
    const newData = data.map((yearObject) => {
        const newCountries = yearObject.countries.filter((country) => {
            return country.life_exp !== null && country.income !== null;
        });

        return {year: yearObject.year, countries: newCountries};
    });

    console.log('after', newData);

    newData.forEach((d) => {
       d.year = +d.year;
    });

    // update(data);

    // d3.interval(() => {
    //     update(data)
    // }, 1000)
});

function update(data) {
    xScale.domain()
}