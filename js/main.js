// Load the CSV file using d3.csv
d3.csv("data/national_health_data_2024.csv").then(function (data) {
  dataset = data.map((row) => ({
    cnty_fips: row.cnty_fips,
    display_name: row.display_name,
    poverty_perc: parseFloat(row.poverty_perc),
    median_household_income: parseInt(row.median_household_income),
    education_less_than_high_school_percent: parseFloat(
      row.education_less_than_high_school_percent
    ),
    air_quality: parseFloat(row.air_quality),
    park_access: parseFloat(row.park_access),
    percent_inactive: parseFloat(row.percent_inactive),
    percent_smoking: parseFloat(row.percent_smoking),
    elderly_percentage: parseFloat(row.elderly_percentage),
    percent_no_health_insurance: parseFloat(row.percent_no_heath_insurance),
    percent_high_blood_pressure: parseFloat(row.percent_high_blood_pressure),
    percent_coronary_heart_disease: parseFloat(
      row.percent_coronary_heart_disease
    ),
    percent_stroke: parseFloat(row.percent_stroke),
    percent_high_cholesterol: parseFloat(row.percent_high_cholesterol),
  }));

  // Now that the data is loaded, we can create dropdowns and initialize the charts
  createDropdowns();
});

// Function to create dropdowns
function createDropdowns() {
  // Define different allowed attributes for X and Y
  const xAttributes = [
    "median_household_income",
    "poverty_perc",
    "education_less_than_high_school_percent",
  ];

  const yAttributes = [
    "percent_smoking",
    "percent_inactive",
    "percent_coronary_heart_disease",
  ];

  const xSelect = d3.select("#x-select").on("change", updateCharts);
  const ySelect = d3.select("#y-select").on("change", updateCharts);

  // Populate the X dropdown with its allowed options
  xSelect
    .selectAll("option")
    .data(xAttributes)
    .enter()
    .append("option")
    .text((d) => d.replace(/_/g, " "))
    .attr("value", (d) => d);

  // Populate the Y dropdown with its allowed options
  ySelect
    .selectAll("option")
    .data(yAttributes)
    .enter()
    .append("option")
    .text((d) => d.replace(/_/g, " "))
    .attr("value", (d) => d);

  // Set initial values for both dropdowns
  xSelect.property("value", "median_household_income");
  ySelect.property("value", "percent_smoking");

  // Call both updates initially with the selected X and Y values
  updateCharts(); // We call the shared update function
}

// Shared function to update both charts based on selected attributes
function updateCharts() {
  const xSelect = d3.select("#x-select");
  const ySelect = d3.select("#y-select");

  const xValue = xSelect.node().value;
  const yValue = ySelect.node().value;

  // Update both charts with the new values
  updateScatterplot(xValue, yValue);
  updateBarChart(xValue, yValue);
}

// Function to update scatterplot
function updateScatterplot(xAttr, yAttr) {
  d3.select("#scatterplot-container").html(""); // Clear the previous chart

  const margin = { top: 20, right: 30, bottom: 80, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const scatterSvg = d3
    .select("#scatterplot-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d[xAttr])])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, (d) => d[yAttr])])
    .range([height, 0]);

  scatterSvg
    .selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d[xAttr]))
    .attr("cy", (d) => yScale(d[yAttr]))
    .attr("r", 3)
    .style("fill", "steelblue")
    .style("opacity", 0.6);

  scatterSvg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale));

  scatterSvg.append("g").call(d3.axisLeft(yScale));

  scatterSvg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 20)
    .attr("text-anchor", "middle")
    .text(xAttr.replace(/_/g, " "));

  scatterSvg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("text-anchor", "middle")
    .text(yAttr.replace(/_/g, " "));
}

// Function to create and update the bar chart
function updateBarChart(xAttr, yAttr) {
  d3.select("#bar-chart-container").html(""); // Clear previous chart

  const margin = { top: 20, right: 30, bottom: 80, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const barSvg = d3
    .select("#bar-chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Filter dataset to remove undefined/null values for selected attributes
  let filteredData = dataset.filter(
    (d) => d[xAttr] !== undefined && d[yAttr] !== undefined
  );

  // Determine if xAttr is numerical
  const isNumeric = typeof filteredData[0][xAttr] === "number";

  // Sort data in ascending order if xAttr is numeric
  if (isNumeric) {
    filteredData = filteredData.sort((a, b) => a[xAttr] - b[xAttr]);
  }

  // Define x-axis scale
  const xScale = isNumeric
    ? d3
        .scaleLinear()
        .domain([
          d3.min(filteredData, (d) => d[xAttr]),
          d3.max(filteredData, (d) => d[xAttr]),
        ])
        .range([0, width])
    : d3
        .scaleBand()
        .domain(filteredData.map((d) => d[xAttr])) // For categorical data
        .range([0, width])
        .padding(0.2);

  // Define y-axis scale
  const yMax = d3.max(filteredData, (d) => d[yAttr]);
  const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([height, 0]);

  // Create bars
  barSvg
    .selectAll(".bar")
    .data(filteredData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d[xAttr]))
    .attr("y", (d) => yScale(d[yAttr]))
    .attr("width", isNumeric ? 5 : xScale.bandwidth()) // Narrower bars for numeric x-axis
    .attr("height", (d) => height - yScale(d[yAttr]))
    .style("fill", "steelblue");

  // Create X-axis
  const xAxis = isNumeric
    ? d3.axisBottom(xScale).ticks(5) // Show fewer labels (generalized)
    : d3
        .axisBottom(xScale)
        .tickValues(
          xScale
            .domain()
            .filter((_, i) => i % Math.ceil(filteredData.length / 5) === 0)
        ); // Show only every few labels for categorical values

  barSvg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .style("transform", "rotate(-45deg)");

  // Create Y-axis
  barSvg.append("g").call(d3.axisLeft(yScale));

  // Add labels
  barSvg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 20)
    .attr("text-anchor", "middle")
    .text(xAttr.replace(/_/g, " "));

  barSvg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("text-anchor", "middle")
    .text(yAttr.replace(/_/g, " "));
}
