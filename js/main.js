let householdIncomeData = [];
let smokingData = [];

// Load the CSV file using d3.csv
d3.csv("data/national_health_data_2024.csv")
  .then(function (data) {
    data.forEach(function (row) {
      let cnty_fips = row.cnty_fips;
      let display_name = row.display_name;
      let poverty_perc = parseFloat(row.poverty_perc); // Convert to float
      let median_household_income = parseInt(row.median_household_income); // Convert to int
      let education_less_than_high_school_percent = parseFloat(
        row.education_less_than_high_school_percent
      );
      let air_quality = parseFloat(row.air_quality);
      let park_access = parseFloat(row.park_access);
      let percent_inactive = parseFloat(row.percent_inactive);
      let percent_smoking = parseFloat(row.percent_smoking);
      let urban_rural_status = row.urban_rural_status;
      let elderly_percentage = parseFloat(row.elderly_percentage);
      let number_of_hospitals = parseInt(row.number_of_hospitals);
      let number_of_primary_care_physicians = parseInt(
        row.number_of_primary_care_physicians
      );
      let percent_no_health_insurance = parseFloat(
        row.percent_no_heath_insurance
      );
      let percent_high_blood_pressure = parseFloat(
        row.percent_high_blood_pressure
      );
      let percent_coronary_heart_disease = parseFloat(
        row.percent_coronary_heart_disease
      );
      let percent_stroke = parseFloat(row.percent_stroke);
      let percent_high_cholesterol = parseFloat(row.percent_high_cholesterol);

      // Create arrays for data i plan to use
      householdIncomeData.push(median_household_income);
      smokingData.push(percent_smoking);
    });

    createScatterplot(householdIncomeData, smokingData);
  })
  .catch(function (error) {
    console.log("Error loading CSV file: ", error);
  });

function createScatterplot(householdIncomeData, smokingData) {
  const margin = { top: 20, right: 30, bottom: 40, left: 60 }; // Adjust left margin for y-axis label
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const scatterSvg = d3
    .select("#scatterplot-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xScatter = d3
    .scaleLinear()
    .domain([0, d3.max(householdIncomeData)]) // Scale based on max value of household income
    .range([0, width]);

  const yScatter = d3
    .scaleLinear()
    .domain([0, 100]) // Percent range from 0 to 100
    .range([height, 0]);

  scatterSvg
    .selectAll("circle")
    .data(householdIncomeData)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => xScatter(d))
    .attr("cy", (d, i) => yScatter(smokingData[i]))
    .attr("r", 3)
    .style("fill", "orange")
    .style("opacity", 0.6);

  scatterSvg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScatter));

  scatterSvg.append("g").call(d3.axisLeft(yScatter));

  scatterSvg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .attr("text-anchor", "middle")
    .text("Median Household Income");

  // Y-axis label for Percent Smoking
  scatterSvg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("text-anchor", "middle")
    .text("Percent Smoking");
}
