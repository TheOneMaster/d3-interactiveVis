"use strict"

function useCsv(fileList){
    const fileData = fileList[0]
    const name = fileData.name;
    const reader = new FileReader()
    
    reader.onload = function(event){
        d3.csv(event.target.result, d3.autoType)
            .then(data => plotData(data));
    }
    reader.readAsDataURL(fileData)
    document.getElementById("filename").innerHTML = name;
    // document.getElementById("submitData").style.display = "none"
}

function plotData(data){
    // Define constant variables
    const figWidth = 700;
    const figHeight = 500;
    const figMargin = {top: 20, bottom: 20, left: 20, right: 20};
    const padding = {top: 60, bottom: 60, left: 40, right:40}

    const innerWidth = figWidth - (figMargin.left + figMargin.right)
    const innerHeight = figHeight - (figMargin.top + figMargin.bottom)

    const width = innerWidth - (padding.left + padding.right)
    const height = innerHeight - (padding.top + padding.bottom)
    

    const totalPop = d3.sum(data, (d) => d.male+d.female);
    let percentage = val => val/totalPop;

    /* Uses this value for max range of the x-axis for the graph so that comparisons can be made without 
    being forced to adjust for different x-axis values for the 2 sides.
    */
    const maxVal = Math.max(
        d3.max(data, (d) => percentage(d.female)),
        d3.max(data, (d) => percentage(d.male))
    ); 

    // Create the SVG figure
    let svg = d3.select("#plot").append("svg")
        .attr("id", "svg")
        .attr('width', figWidth)
        .attr('height', figHeight)
        .append("g")
            .attr("transform", `translate(${figMargin.left}, ${figMargin.top})`)

    
    // Used to plot the data (No title or axis labels)
    let g = svg.append("g")
        .attr("class", "plot")
        .attr("transform", `translate(${padding.left}, ${padding.top})`)

    let yScale = d3.scaleLinear()
        .domain([maxVal, 0])
        .range([0, height])
        .nice();

    let xScale = d3.scaleBand()
        .domain(data.map(d => d.age))
        .range([0, width]);

    let xAxis = d3.axisBottom(xScale);
    
    let yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(".2p"));

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    g.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(0, 0)`)
        .call(yAxis);

    g.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale)
        .tickSize(-width, 0,0)
        .tickFormat(""));

    let maleBars = g.append("g")
        .attr("class", "male")
        .attr("transform", `translate(0, ${height})scale(1, -1)`);

    let femaleBars = g.append("g")
        .attr("class", "female")
        .attr("transform", `translate(0, ${height})scale(1, -1)`);

    maleBars.selectAll(".bar.male")
        .data(data)
        .enter().append("rect")
            .attr("class", "bar male")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("x", d => xScale(d.age))
            .attr("y", 0)
            .attr("width", xScale.bandwidth())
            .attr( "height", d => height - yScale( percentage(d.male) ) );

    femaleBars.selectAll(".bar.female")
        .data(data)
        .enter().append("rect")
            .attr("class", "bar female")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("x", d => xScale(d.age))
            .attr("y", 0)
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(percentage(d.female)));

}
