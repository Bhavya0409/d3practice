const margin = { left: 80, right: 20, top: 50, bottom: 100 };

const width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

let revenueDataVisible = true;

const t = d3.transition().duration(750);

const g = d3.select("#chart-area").append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom).append('g').attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

const xAxisGroup = g.append('g').attr('class', 'x-axis-label').attr("transform", "translate(0, " + height + ")");

const yAxisGroup = g.append('g').attr('class', 'y-axis-label');

const xScale = d3.scaleBand().range([0, width]).padding(0.2);

const yScale = d3.scaleLinear().range([height, 0]);

g.append('text').text('Month').attr('x', width / 2).attr('y', height + 50).attr('text-anchor', 'middle').attr('font-size', '20px');

const yLabel = g.append('text').text('Revenue').attr('x', -height / 2).attr('y', '-60').attr('text-anchor', 'middle').attr('font-size', '20px').attr('transform', 'rotate(-90)');

d3.json("data/revenues.json").then(function (data) {
    data.forEach(function (d) {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    d3.interval(function () {
        const newData = revenueDataVisible ? data : data.slice(1);
        update(newData);
        revenueDataVisible = !revenueDataVisible;
    }, 1000);

    update(data);
});

function update(data) {
    const value = revenueDataVisible ? 'revenue' : 'profit';

    xScale.domain(data.map(d => d.month));
    yScale.domain([0, d3.max(data, d => d[value])]);

    // X Axis
    const xAxisCall = d3.axisBottom(xScale);
    xAxisGroup.transition(t).call(xAxisCall);

    // Y Axis
    const yAxisCall = d3.axisLeft(yScale).tickFormat(d => "$" + d);
    yAxisGroup.transition(t).call(yAxisCall);

    // JOIN new data with old elements
    const rects = g.selectAll('rect').data(data, d => d.month);

    // EXIT old elements not present in new data
    rects.exit().attr('fill', 'red').transition(t).attr('y', yScale(0)).attr('height', 0).remove();

    // UPDATE old elements present in new data
    rects.transition(t).attr('x', d => xScale(d.month)).attr('y', d => yScale(d[value])).attr('width', xScale.bandwidth()).attr('height', d => height - yScale(d[value]));

    // ENTER new elements present in new data

    rects.enter().append('rect').attr('fill', 'grey').attr('y', yScale(0)).attr('height', 0).attr('x', d => xScale(d.month)).attr('width', xScale.bandwidth()).merge(rects).transition(t).attr('x', d => xScale(d.month)).attr('width', xScale.bandwidth()).attr('y', d => yScale(d[value])).attr('height', d => height - yScale(d[value]));

    yLabel.text(revenueDataVisible ? 'Revenue' : 'Profit');
}