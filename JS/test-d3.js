"use strict"

const WIDTH = 500;
const HEIGHT = 300;
const MARGIN = {
    top: 20,
    bottom: 24,
    right: 20,
    left: 20,
    middle: 28
};
const regionWidth = WIDTH/2 - MARGIN.middle;

let pointA = regionWidth; // Starting point for y-axis of left-side
let pointB = WIDTH-regionWidth; // Starting point for y-axis of right-side

let exampleData = [
    {group: '0-9', male: 10, female: 12},
    {group: '10-19', male: 14, female: 15},
    {group: '20-29', male: 15, female: 18},
    {group: '30-39', male: 18, female: 18},
    {group: '40-49', male: 21, female: 22},
    {group: '50-59', male: 19, female: 24},
    {group: '60-69', male: 15, female: 14},
    {group: '70-79', male: 8, female: 10},
    {group: '80-89', male: 4, female: 5},
    {group: '90-99', male: 2, female: 3},
    {group: '100-109', male: 1, female: 1},
  ];

let totalPop = d3.sum(exampleData, (d) => d.male + d.female);
let percentage = (d) => d/totalPop;

let svg = d3.select('body').append('svg')
  .attr('width', MARGIN.left + WIDTH + MARGIN.right)
  .attr('height', MARGIN.top + HEIGHT + MARGIN.bottom)
  .append('g')
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

let maxVal = Math.max(
    d3.max(exampleData, (d) => percentage(d.male)),
    d3.max(exampleData, (d) => percentage(d.female))
);

// Scales

let xScale = d3.scaleLinear()
  .domain([0, maxVal])
  .range([0, regionWidth])
  .nice();

let yscale = d3.scaleBand()
  .domain([exampleData.map((d) => d.group)])
  .range([HEIGHT, 0]);

// Axes

let xAxisRight = d3.svg.axis()
  .scale(xScale)
  .orient('bottom')
  .tickFormat(d3.format('%'))

let xAxisLeft = d3.svg.axis()
  .scale(xScale.copy().range([pointA, 0]))
  .orient('bottom');




