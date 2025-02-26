// Load data using D3
d3.csv("data/national_health_data_2024.csv").then(function (data) {
  data.forEach((d) => {
    d.poverty_perc = parseFloat(d.poverty_perc);
    d.percent_smoking = parseFloat(d.percent_smoking);
    d.display_name = d.display_name.replace(/"/g, "").trim();
  });

  createSmokingChart(data);

  createPovertyChart(data);
});

function createSmokingChart(data) {
  const svg = d3.select("#smoking-chart");
  const margin = { top: 20, right: 30, bottom: 80, left: 70 };
  const width = svg.attr("width") - margin.left - margin.right;
  const height = svg.attr("height") - margin.top - margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.1);
  const y = d3.scaleLinear().range([height, 0]);

  const stateData = d3
    .groups(data, (d) => d.display_name.split(",")[1].trim())
    .map(([key, values]) => ({
      key: key,
      value: d3.mean(values, (d) => d.percent_smoking),
    }));

  x.domain(stateData.map((d) => d.key));
  y.domain([0, d3.max(stateData, (d) => d.value)]);

  g.append("g")
    .selectAll(".bar")
    .data(stateData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.key))
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.value))
    .attr("height", (d) => height - y(d.value));

  // X-Axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Y-Axis
  g.append("g").call(d3.axisLeft(y));

  // X-axis label
  svg
    .append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("State");

  // Y-axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2 - margin.top)
    .attr("y", margin.left - 50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Average Smoking Percentage");
}

function createPovertyChart(data) {
  const svg = d3.select("#poverty-chart");
  const margin = { top: 20, right: 30, bottom: 80, left: 70 };
  const width = svg.attr("width") - margin.left - margin.right;
  const height = svg.attr("height") - margin.top - margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.1);
  const y = d3.scaleLinear().range([height, 0]);

  const stateData = d3
    .groups(data, (d) => d.display_name.split(",")[1].trim())
    .map(([key, values]) => ({
      key: key,
      value: d3.mean(values, (d) => d.poverty_perc),
    }));

  x.domain(stateData.map((d) => d.key));
  y.domain([0, d3.max(stateData, (d) => d.value)]);

  g.append("g")
    .selectAll(".bar")
    .data(stateData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.key))
    .attr("width", x.bandwidth())
    .attr("y", (d) => y(d.value))
    .attr("height", (d) => height - y(d.value));

  // X-Axis
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Y-Axis
  g.append("g").call(d3.axisLeft(y));

  // X-axis label
  svg
    .append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", height + margin.top + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("State");

  // Y-axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2 - margin.top)
    .attr("y", margin.left - 50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Poverty Rate (%)");
}
