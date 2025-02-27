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
  createMapX(xValue);
  createMapY(yValue);
}

// Function to update scatterplot
function updateScatterplot(xAttr, yAttr, selectedData) {
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

  // Use selected data if it exists, otherwise use the full dataset
  const data = selectedData && selectedData.length > 0 ? selectedData : dataset;

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[xAttr])])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yAttr])])
    .range([height, 0]);

  const circles = scatterSvg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d[xAttr]))
    .attr("cy", (d) => yScale(d[yAttr]))
    .attr("r", 3)
    .style("fill", "steelblue")
    .style("opacity", 0.6);

  // Tooltip element
  const tooltip = d3.select(".tooltip");

  // Hover effect: Add stroke on hover and show tooltip
  circles
    .on("mouseover", function (event, d) {
      d3.select(this).style("stroke", "black").style("stroke-width", 2);

      tooltip
        .style("visibility", "visible")
        .html(
          `
          <div>${d.display_name}</div>
          <div>${xAttr.replace(/_/g, " ")}: ${d[xAttr]}</div>
          <div>${yAttr.replace(/_/g, " ")}: ${d[yAttr]}</div>`
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 30}px`);
    })
    .on("mouseout", function () {
      d3.select(this).style("stroke", "none");

      tooltip.style("visibility", "hidden");
    })
    .on("click", function (event, d) {
      const countyName = d.display_name;
      const xValue = d[xAttr];
      const yValue = d[yAttr];
      alert(
        `County: ${countyName}\n${xAttr.replace(
          /_/g,
          " "
        )}: ${xValue}\n${yAttr.replace(/_/g, " ")}: ${yValue}`
      );
    });

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

  // Implement the brush interaction
  const brush = d3
    .brush()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("start brush", function (event) {
      const [[x0, y0], [x1, y1]] = event.selection;
      // Filter dataset based on the brush selection
      const selectedData = dataset.filter(
        (d) =>
          xScale(d[xAttr]) >= x0 &&
          xScale(d[xAttr]) <= x1 &&
          yScale(d[yAttr]) >= y0 &&
          yScale(d[yAttr]) <= y1
      );
      // Highlight circles within the brushed region
      circles
        .style("fill", (d) =>
          selectedData.includes(d) ? "orange" : "steelblue"
        )
        .style("opacity", (d) => (selectedData.includes(d) ? 1 : 0.6));

      // Update other visualizations
      updateBarChart(xAttr, yAttr, selectedData);
    });

  scatterSvg.append("g").call(brush);
}

// Function to create and update the bar chart
function updateBarChart(xAttr, yAttr, selectedData) {
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

  // Use selected data if it exists, otherwise use the full dataset
  let filteredData =
    selectedData && selectedData.length > 0 ? selectedData : dataset;

  const isNumeric = typeof filteredData[0][xAttr] === "number";

  if (isNumeric) {
    filteredData = filteredData.sort((a, b) => a[xAttr] - b[xAttr]);
  }

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
        .domain(filteredData.map((d) => d[xAttr]))
        .range([0, width])
        .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(filteredData, (d) => d[yAttr])])
    .nice()
    .range([height, 0]);

  const bars = barSvg
    .selectAll(".bar")
    .data(filteredData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d[xAttr]))
    .attr("y", (d) => yScale(d[yAttr]))
    .attr("width", isNumeric ? 5 : xScale.bandwidth())
    .attr("height", (d) => height - yScale(d[yAttr]))
    .style("fill", "steelblue");

  bars
    .on("mouseover", function (event, d) {
      // Show the tooltip
      d3
        .select(".tooltip")
        .style("visibility", "visible")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 30 + "px").html(`
          <div>County: ${d.display_name}</div>
          <div>${xAttr.replace(/_/g, " ")}: ${d[xAttr]}</div>
          <div>${yAttr.replace(/_/g, " ")}: ${d[yAttr]}</div>
        `);

      // Add stroke to bar
      d3.select(this).style("stroke", "black").style("stroke-width", 2);
    })
    .on("mouseout", function () {
      d3.select(".tooltip").style("visibility", "hidden");
      d3.select(this).style("stroke", "none");
    });

  const xAxis = isNumeric
    ? d3.axisBottom(xScale).ticks(5)
    : d3
        .axisBottom(xScale)
        .tickValues(
          xScale
            .domain()
            .filter((_, i) => i % Math.ceil(filteredData.length / 5) === 0)
        );

  barSvg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .style("transform", "rotate(-45deg)");

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

  // Implement the brush interaction
  const brush = d3
    .brush()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("start brush", function (event) {
      const [[x0, y0], [x1, y1]] = event.selection;
      // Filter dataset based on the brush selection
      const brushedData = dataset.filter(
        (d) =>
          xScale(d[xAttr]) >= x0 &&
          xScale(d[xAttr]) <= x1 &&
          yScale(d[yAttr]) >= y0 &&
          yScale(d[yAttr]) <= y1
      );
      // Highlight bars within the brushed region
      bars
        .style("fill", (d) =>
          brushedData.includes(d) ? "orange" : "steelblue"
        )
        .style("opacity", (d) => (brushedData.includes(d) ? 1 : 0.6));

      // Update scatterplot based on brushed data
      updateScatterplot(xAttr, yAttr, brushedData);
    });

  // Add the brush to the bar chart SVG
  barSvg.append("g").call(brush);
}

/**
 * Load TopoJSON data of the world and the data of the world wonders
 */

function createMapX(selected) {
  // Clear previous map
  d3.select(".viz").select("svg").remove();

  Promise.all([
    d3.json("data/counties-10m.json"),
    d3.csv("data/national_health_data_2024.csv"),
  ])
    .then((data) => {
      const geoData = data[0];
      const health_data = data[1];

      // Combine both datasets by adding the population density to the TopoJSON file
      console.log(geoData);
      geoData.objects.counties.geometries.forEach((d) => {
        console.log(d);
        for (let i = 0; i < health_data.length; i++) {
          if (d.id === health_data[i].cnty_fips) {
            d.properties.pop = +health_data[i][selected];
            d.properties.selectedData = +health_data[i][selected];
            d.properties.display_name = health_data[i].display_name;
          }
        }
      });

      const choroplethMap = new ChoroplethMap(
        {
          parentElement: ".viz",
        },
        geoData
      );

      // Add hover interaction
      choroplethMap.svg
        .selectAll("path")
        .on("mouseover", function (event, d) {
          const countyName = d.properties.display_name;
          const value = d.properties.selectedData;
          d3.select(this).style("stroke", "black").style("stroke-width", 2);

          // Show tooltip
          d3.select(".tooltip")
            .html(`<strong>${countyName}</strong><br>Value: ${value}`)
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px")
            .style("visibility", "visible");
        })
        .on("mouseout", function () {
          d3.select(this).style("stroke", "none");
          d3.select(".tooltip").style("visibility", "hidden");
        })
        .on("click", function (event, d) {
          const countyName = d.properties.display_name;
          const value = d.properties.selectedData;
          alert(`County: ${countyName}\nValue: ${value}`);
        });
    })
    .catch((error) => console.error(error));
}

function createMapY(selected) {
  // Clear previous map
  d3.select(".viz2").select("svg").remove();

  Promise.all([
    d3.json("data/counties-10m.json"),
    d3.csv("data/national_health_data_2024.csv"),
  ])
    .then((data) => {
      const geoData = data[0];
      const health_data = data[1];

      // Combine both datasets by adding the population density to the TopoJSON file
      console.log(geoData);
      geoData.objects.counties.geometries.forEach((d) => {
        console.log(d);
        for (let i = 0; i < health_data.length; i++) {
          if (d.id === health_data[i].cnty_fips) {
            d.properties.pop = +health_data[i][selected];
            d.properties.selectedData = +health_data[i][selected];
            d.properties.display_name = health_data[i].display_name;
          }
        }
      });

      const choroplethMap = new ChoroplethMap(
        {
          parentElement: ".viz2",
        },
        geoData
      );

      // Add hover interaction
      choroplethMap.svg
        .selectAll("path")
        .on("mouseover", function (event, d) {
          const countyName = d.properties.display_name;
          const value = d.properties.selectedData;
          d3.select(this).style("stroke", "black").style("stroke-width", 2);

          // Show tooltip
          d3.select(".tooltip")
            .html(`<strong>${countyName}</strong><br>Value: ${value}`)
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px")
            .style("visibility", "visible");
        })
        .on("mouseout", function () {
          d3.select(this).style("stroke", "none");
          d3.select(".tooltip").style("visibility", "hidden");
        })
        .on("click", function (event, d) {
          const countyName = d.properties.display_name;
          const value = d.properties.selectedData;
          alert(`County: ${countyName}\nValue: ${value}`);
        });
    })
    .catch((error) => console.error(error));
}
