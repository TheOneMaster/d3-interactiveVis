"use strict"

function useCsv(fileList){
  /*
  Utilizes the CSV file passed to the function. The file can be passed in the form
  of an object (file input from HTML) or as a string to the directory (for the test).
  Reads the csv data into an array of dictionaries and passes that data into the 
  plot function. 
  */
  const filetype = typeof(fileList);
  if (filetype == 'object') {
      const fileData = fileList[0];
      const name = fileData.name;

      // d3 is unable to read blob data, thus it must be passed as a file to the function
      const reader = new FileReader();
      
      reader.onload = function(event){
          d3.csv(event.target.result, d3.autoType)
              .then(data => plotData(data));
      }
      reader.readAsDataURL(fileData);
      document.getElementById("filename").innerHTML = name;
  } else {
      d3.csv(fileList, d3.autoType)
          .then(data => plotData(data));
  }
}

function plotData(data) {

  // Define constants for the function

  // Dimensions of the entire figure
  const figHeight = 500;
  const figWidth = 1000;

  const figMargin = {top: 20, bottom: 20, left: 20, right: 20};
  const padding = {top: 80, bottom: 80, left: 40, right: 40, center: 25};

  // Dimensions of the figure after removing the margins (used for setting labels)
  const innerHeight = figHeight - (figMargin.top + figMargin.bottom);
  const innerWidth = figWidth - (figMargin.left + figMargin.right);

  // Removed padding (specifically for data vis, no labels)
  const height = innerHeight - (padding.top + padding.bottom);
  const width = innerWidth - (padding.left + padding.right);

  // The length of one region in the population pyramid (i.e size of male/female side)
  const regionWidth = width/2 - padding.center;

  // Starting and ending points for the graphs
  const maleEnd = regionWidth;
  const femaleStart = width - maleEnd;

  const totalPop = d3.sum(data, d => d.male+d.female);
  let percentage = val => val/totalPop;

  /*
    This block is used to show summary statistics of the given data.
    They are displayed to the left div in the HTML doc. 
  */
   document.getElementById("totalPop").innerHTML = `Total population: ${d3.format(",.2r")(totalPop)}`;
   tabulate(data);

  // Used to set the max value of the scale on both sides for easy comparison between male and female
  const maxVal = Math.max(
    d3.max(data, d => percentage(d.male)),
    d3.max(data, d => percentage(d.female))
  );

  /*
    Create the figure element. Not used for plotting the data, mainly used for adding labels and other data
    to the figure. 
  */

  let svg = d3.select("#barplot").append("svg")
    .attr("width", innerWidth)
    .attr("height", innerHeight)
    .append("g")
      .attr("transform", translate(figMargin.left, figMargin.top));

  //Add Labels to the plot. Title for the plot, x and y labels, and the male/female label  
  let x_center = padding.left + regionWidth + padding.center;

  // Plot title
  svg.append("text")
    .attr("id", "plot_title")
    .attr("x", padding.left)
    .attr("y", padding.top/2)
    .text("Population Pyramid");

  // Y Label
  svg.append("text")
    .attr("id", "ylabel")
    .attr("x", x_center)
    .attr("y", padding.top-10)
    .style("text-anchor", "middle")
    .text("Age Groups")
    .attr("font-weight", "bold");

  // X Label
  svg.append("text")
    .attr("id", "xlabel")
    .attr("x", x_center)
    .attr("y", innerHeight - padding.bottom/2)
    .style("text-anchor", "middle")
    .text("Percentage of population")
    .attr("font-weight", "bold");

  // Male label (over male section)
  svg.append("text")
    .attr("x", padding.left + regionWidth/2)
    .attr("y", padding.top - 10)
    .text("Male")
    .style("text-anchor", "middle")
    .style("font-style", "italic");

  // Female label (over female section)
  svg.append("text")
    .attr("x", innerWidth - (padding.right + regionWidth/2))
    .attr("y", padding.top - 10)
    .text("Female")
    .style("text-anchor", "middle")
    .style("font-style", "italic");

  /*
    Actual visualisation of the data is done in this element. Male and female bars are drawn along 
    with X and Y axes.
  */

  let plot = svg.append("g")
    .attr("class", "plot")
    .attr("transform", translate(padding.left, padding.top))
  
  // Scales for the Axes

  let xScaleRight = d3.scaleLinear()
    .domain([0, maxVal])
    .range([0, regionWidth])
    .nice();

  // Scale is reversed since it is going from right to left
  let xScaleLeft = d3.scaleLinear()
    .domain([0, maxVal])
    .range([regionWidth, 0])
    .nice();

  let yScale = d3.scaleBand()
    .domain(data.map(d => d.age))
    .range([height, 0])
    .padding(0.1);

  // Axes

  // X axes are formatted to 2 sig fig percentages (Ex: 0.10 -> 10%)
  let xAxisLeft = d3.axisBottom(xScaleLeft)
    .tickFormat(d3.format(".2p"));
  let xAxisRight = d3.axisBottom(xScaleRight)
    .tickFormat(d3.format(".2p"));

  let yAxis = d3.axisRight(yScale)
    .tickPadding((padding.center+14)/2);
  let yAxisRight = d3.axisLeft(yScale)
    .tickFormat('');

  // Draw Axes on the plot
  let xAxes = plot.append("g")
    .attr("class", "xaxis");

  xAxes.append("g")
    .attr("class", "xaxis left")
    .attr("transform", translate(0, height))
    .call(xAxisLeft);

  xAxes.append("g")
    .attr("class", "xaxis right")
    .attr("transform", translate(femaleStart, height))
    .call(xAxisRight);

  let yAxes = plot.append("g")
    .attr("class", "yaxis");

  yAxes.append("g")
    .attr("class", "yaxis left")
    .attr("transform", translate(maleEnd, 0))
    .call(yAxis)
    .selectAll("text")
      .style("text-anchor", "middle");

  yAxes.append("g")
    .attr("class", "yaxis right")
    .attr("transform", translate(femaleStart, 0))
    .call(yAxisRight);
  
  // Creates bars for males and females

  // Group for male bars
  let maleData = plot.append("g")
    .attr("class", "male")
    .attr("transform", `${translate(maleEnd, 0)}scale(-1, 1)`);

  // Group for female bars
  let femaleData = plot.append("g")
    .attr("class", "female")
    .attr("transform", `${translate(femaleStart, 0)}scale(1, 1)`);

  // Draw Male bars
  maleData.selectAll("bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "male bar")
      .attr("y", d => yScale(d.age))
      .attr("x", 0)
      .attr("width", d => regionWidth - xScaleLeft(percentage(d.male)))
      .attr("height", yScale.bandwidth())
      .on("click", onClick);

  // Draw Female bars
  femaleData.selectAll("bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "female bar")
      .attr("y", d => yScale(d.age))
      .attr("x", 0)
      .attr("width", d => xScaleRight(percentage(d.female)))
      .attr("height", yScale.bandwidth())
      .on("click", onClick);


  // Helper functions

  function onClick(data) {
    
    let selected = this.classList[2] == "selected" ? true : false;
    
    if (selected) {
      d3.select(this).classed("selected", false);
    } else {
      d3.selectAll(".bar.selected").classed("selected", false);
      d3.select(this).classed("selected", true);
    }  

  }

  function onHover(data) {
    
  }

  function translate(x, y) {
    // Helper function for translate CSS
    return `translate(${x}, ${y})`;
  }


  
}

function tabulate(data){
  const columns = data.columns;

  let table = d3.select(".table");
  let thead = table.append("thead");
  let tbody = table.append("tbody");

  thead.append("tr")
      .selectAll("th")
      .data(columns)
      .enter()
      .append("th")
          .text(d => d);
  
  
  let rows = tbody.selectAll("tr")
      .data(data)
      .enter()
      .append("tr");
  
  // create a cell in each row for each column
  let cells = rows.selectAll("td")
      .data(function(row) {
          return columns.map(function(column) {
              return {column: column, value: row[column]};
          });
      })
      .enter()
      .append("td")
      .attr("style", "font-family: Courier")
          .html(function(d) { return d.value; });
  
  return table;

}

