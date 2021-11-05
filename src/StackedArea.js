import { useD3 } from './useD3';
import { React, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';



function StackedAreaChart({ data }) {
  const xAxisLabel = 'asdfasdfASDFASDFASDffasda'; // PLACEHOLDER
  const yAxisLabel = 'qwreqwerREQWERQWERQWerqwe';
  const [size, setSize] = useState([0, 0]);

  function updateSize() {
    setSize([window.innerWidth, window.innerHeight]);
  }

  useLayoutEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [])

  const ref = useD3(
    (svg) => {
      // Clear all of the elements from the screen before they're appended again
      svg.selectAll("path").remove();
      svg.selectAll(".axis--x").remove();
      svg.selectAll(".axis--y").remove();
      svg.selectAll(".layer").remove();
      svg.selectAll(".area").remove();
      svg.selectAll(".labelText").remove();

      let margin = {top: 20, right: 20, bottom: 30, left: 50};
  
      const container = ref.current.getBoundingClientRect();
      const height = container.height - margin.top - margin.bottom;
      const width = container.width - margin.left - margin.right;

      const keys = []; // find the fields
      for (let key in data[0]) { // make more abstractable (what if data points are missing for some fields?)
        if (key !== 'date') keys.push(key);
      }

      function findYDomainMax(data, keyArr) {
        let yDomainMax = 0;
        data.forEach(obj => {
          let stackedHeight = 0;
          for (const key of keyArr) {
            stackedHeight += obj[key];
            if (stackedHeight > yDomainMax) yDomainMax = stackedHeight;
          }
        });
        return yDomainMax;
      }

      let x = d3.scaleTime().domain([data[0].date, data[data.length-1].date]).range([0, width]), 
          y = d3.scaleLinear().domain([0, findYDomainMax(data, keys)]).range([height, 0]),
          z = d3.scaleOrdinal(d3.schemeCategory10); // COLORS. HOW TO CUSTOMIZE?

      let stack = d3.stack();
      // yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d[1] - d[0]; }); }),
      // yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d[1]; }); );

      let area = d3.area()
          .x(function(d, i) { return x(d.data.date); })
          .y0(function(d) { return y(d[0]); }) // set to 0 for overlay?
          .y1(function(d) { return y(d[1]); });

      let g = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      x.domain(d3.extent(data, function(d) {  // interpret date from string, Date, num
        if (typeof d.date === 'string') d.date = Date.parse(d.date);
        return +d.date; 
      }));
      z.domain(keys);
      stack.keys(keys);

      let layer = g.selectAll(".layer")
        .data(stack(data)) // what if we don't stack? (for overlay)
        // .data([data]) // 
        .enter().append("g")
          .attr("class", "layer");

      layer.append("path")
          .attr("class", "area")
          .style("fill", function(d) { return z(d.key); })
          .attr("d", area); 

      layer.filter(function(d) { return d[d.length - 1][1] - d[d.length - 1][0] > 0.01; })
        .append("text")
          .attr('class', 'labelText')
          .attr("x", width - 6)
          .attr("y", function(d) { return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2); })
          .attr("dy", ".35em")
          .style("font", "10px sans-serif")
          .style("text-anchor", "end")
          .text(function(d) { return d.key; });

      g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      g.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10));



      // Draw peripherals
      // Create the axis generators
      const xAxis = d3.axisBottom(x).ticks(5)

      const yAxis = d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((val) => `${val}%`)

          const xAxisGroup = svg
          .select(".x-axis")
          .attr("transform", `translate(${margin.left}, ${height})`)
          .call(xAxis)
  
        const yAxisGroup = svg
          .select(".y-axis")
          .attr("transform", `translate(${margin.left}, ${margin.top})`)
          .call(yAxis)
  
        // Append your labels
        xAxisGroup
          .append("text")
          .attr("class", "x-axis-label")
          .attr("transform", `translate(${width}, ${margin.bottom})`)
          .attr("text-anchor", "end")
          .attr("fill", "#5D6971")
          .text(xAxisLabel)
  
        yAxisGroup
          .append("text")
          .attr("class", "y-axis-label")
          .attr("transform", `translate(0, -8)`)
          .attr("text-anchor", "end")
          .attr("fill", "#5D6971")
          .text(yAxisLabel)
    },
    [data, size]
  );

return (
  <svg
    ref={ref}
    style={{
      height: '100%',
      width: '100%'
      // marginRight: "0px",
      // marginLeft: "0px",
    }}
  >
    {/* <g className="layer" />
    <g className="area" />
    <g className="axis axis--x" />
    <g className="axis axis--y" /> */}
  </svg>
);
}

export default StackedAreaChart;