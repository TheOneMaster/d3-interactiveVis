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

function plotData(data){
    // Define constant variables
    const figWidth = 1000;
    const figHeight = 700;
    const figMargin = {top: 20, bottom: 20, left: 20, right: 20};
    const padding = {top: 60, bottom: 60, left: 40, right:40}

    const innerWidth = figWidth - (figMargin.left + figMargin.right)
    const innerHeight = figHeight - (figMargin.top + figMargin.bottom)

    const width = innerWidth - (padding.left + padding.right)
    const height = innerHeight - (padding.top + padding.bottom)
    
    const totalPop = d3.sum(data, (d) => d.male+d.female);
    let percentage = val => val/totalPop;

    /*
    This block is used to show summary statistics of the given data.
    They are displayed to the left div in the HTML doc. 
    */
    document.getElementById("totalPop").innerHTML = `Total population: ${totalPop}`;
    tabulate(data);
    
    
    /* Uses this value for max range of the x-axis for the graph so that comparisons can be made without 
    being forced to adjust for different x-axis values for the 2 sides.
    */
    const maxVal = Math.max(
        d3.max(data, (d) => percentage(d.female)),
        d3.max(data, (d) => percentage(d.male))
    ); 

    // Create the SVG figure
    let svg = d3.select("#barplot").append("svg")
        .attr("id", "svg")
        .attr('width', figWidth)
        .attr('height', figHeight)
        .append("g")
            .attr("transform", `translate(${figMargin.left}, ${figMargin.top})`);

    // Title for the plot
    svg.append("text")
        .attr("id", "plot_title")
        .attr("x", padding.left)
        .attr("y", padding.top/2)
        .text("Population Pyramid");

    svg.append("text")
        .attr("class", "label")
        .attr("y", 0)
        .attr("x", -(height)/2 - padding.top)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Percentage (%)");

    svg.append("text")
        .attr("class", "label")
        .attr("y", height+padding.top + padding.bottom/1.5)
        .attr("x", width/2 + padding.left)
        .attr("text-anchor", "middle")
        .text("Age Groups");
    /*
    All code from this point on is used to create the plot
    */

    // Group for the plot (Does not contain title or axes labels)
    let plot = svg.append("g")
        .attr("class", "plot")
        .attr("transform", `translate(${padding.left}, ${padding.top})`)

    // Create the Scales

    // Domain is reversed so that it shows axis in descending order
    let yScale = d3.scaleLinear()
        .domain([maxVal, 0])
        .range([0, height])
        .nice();
    let xScale = d3.scaleBand()
        .domain(data.map(d => d.age))
        .range([0, width])
        .padding(0.1);

    // Create Axes for the plot
    let xAxis = d3.axisBottom(xScale);
    let yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(".2p"));

    plot.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);
    plot.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(0, 0)`)
        .call(yAxis);

    // Add gridlines for the Y-axis. Lines are present at each tick
    plot.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale)
        .tickSize(-width, 0,0)
        .tickFormat(""));

    let maleBars = plot.append("g")
        .attr("class", "male")
        .attr("transform", `translate(0, ${height})scale(1, -1)`);
    let femaleBars = plot.append("g")
        .attr("class", "female")
        .attr("transform", `translate(0, ${height})scale(1, -1)`);

    
    maleBars.selectAll(".bar.male")
        .data(data)
        .enter().append("rect")
            .attr("class", "bar male")
            .attr("x", d => xScale(d.age))
            .attr("y", 0)
            .attr("width", xScale.bandwidth())
            .attr( "height", d => height - yScale( percentage(d.male) ) )
            .style("fill", "#1f77b4")
            .on("click", onClick);
    
    femaleBars.selectAll(".bar.female")
        .data(data)
        .enter().append("rect")
            .attr("class", "bar female")
            .attr("x", d => xScale(d.age))
            .attr("y", 0)
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(percentage(d.female)))
            .style("fill", "#e377c2")
            .on("click", onClick);

    function onMouseEnter(datum){

    }

    function onClick(datum) {
        let type = this.classList[1];
        if (type == "male"){
            let color = this.style.fill == "rgb(31, 119, 180)" ? "orange" : "1f77b4";
            d3.select(this).style("fill", color);
        } else {
            let color = this.style.fill == "rgb(227, 119, 194)" ? "green" : "e377c2";
            d3.select(this).style("fill", color);
        }        
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
