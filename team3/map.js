window.sharedData = {
  value: null,
  updateValue: function(newValue) {
    this.value = newValue;
    const event = new Event('sharedDataChanged');
    window.dispatchEvent(event);
  }
};

const width = 1200;
const height = 800;

let maxSpending;
let colorScale;

const div = d3.select("#map-container")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


  const svg = d3.select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("margin-left", "90px")
  .style("background-image", "url('images/mapbg.jpeg')")  
  .style("background-size", "cover");

const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(20,20)"); 

d3.json('./europe.geojson').then(function (mapData) {
  d3.csv('./league_spend.csv').then(function (spendingData) {
    const mergedData = mergeData(mapData, spendingData);

    const projection = d3.geoMercator()
      .fitSize([width, height], mapData);

    const pathGenerator = d3.geoPath().projection(projection);

    maxSpending = d3.max(spendingData, d => +d.spend);
    colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxSpending]);

    svg.selectAll("path")
      .data(mergedData.features)
      .enter().append("path")
      .attr("d", pathGenerator)
      .attr("fill", d => {
        const spendingValue = getSpendingValue(d, spendingData);
        return spendingValue > 0 ? colorScale(spendingValue) : "#000";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .on("click", function (event, d) {
        const isTooltipVisible = div.style("opacity") === "0.9";

        window.sharedData.updateValue(d.properties.NAME);

        if (isTooltipVisible) {
          div.transition()
            .duration(200)
            .style("opacity", 0);
        } else {
          div.transition()
            .duration(200)
            .style("opacity", 0.9);

          div.html(`${d.properties.NAME}: ${(getSpendingValue(d, spendingData) / 1e9).toFixed(2)} billion`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
      });

    const legendScale = d3.scaleLinear()
      .domain([0, maxSpending])
      .range([0, 100]); 

    const legendItems = d3.ticks(0, maxSpending, 5);

    const legendItemWidth = 50; 

    legend.selectAll("rect")
      .data(d3.ticks(0, maxSpending, 5)) 
      .enter().append("rect")
      .attr("height", 10)
      .attr("width", legendItemWidth) 
      .attr("x", (d, i) => i * legendItemWidth) 
      .style("fill", d => colorScale(d));

    legend.selectAll("text")
      .data(d3.ticks(0, maxSpending, 5))
      .enter().append("text")
      .attr("x", (d, i) => i * legendItemWidth + 10) 
      .attr("y", 25) 
      .style("font-size", "10px")
      .text(d => (d / 1e9).toFixed(2) + " bn"); 

      legend.append("rect")
  .attr("height", 10)
  .attr("width", legendItemWidth)
  .attr("x", legendItems.length * legendItemWidth) 
  .style("fill", "#000"); 

legend.append("text")
  .attr("x", legendItems.length * legendItemWidth + 5) 
  .attr("y", 25) 
  .style("font-size", "10px")
  .text("Unknown"); 
  });
});


function mergeData(mapData, spendingData) {
  return {
    type: "FeatureCollection",
    features: mapData.features.map(feature => {
      const countryName = feature.properties.NAME;
      const countrySpendingData = spendingData.find(data => data.country === countryName);

      if (countrySpendingData) {
        feature.properties.spending = +countrySpendingData.spending;
      } else {
        feature.properties.spending = 0;
      }

      return feature;
    })
  };
}

function getSpendingValue(feature, spendingData) {
  const countryName = feature.properties.NAME;
  const countrySpendingData = spendingData.find(data => data.country === countryName);
  return countrySpendingData ? +countrySpendingData.spend : 0;
}



