//scatterPlot.js
export function createScatterPlot(data, elementId, onNodeHighlight, displayDetails) {
    
    const margin = { top: 10, right: 30, bottom: 40, left: 50 },
          width = 420 - margin.left - margin.right,
          height = 420 - margin.top - margin.bottom;

   
    // append the svg object to the specified element
    const svg = d3.select(`#${elementId}`)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    
    // create a group for the dots
    const dotsGroup = svg.append("g");

    // add X axis
    const x = d3.scaleLinear()
        .domain([d3.min(data, d => d["PCA1"]), d3.max(data, d => d["PCA1"])])
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
      
       // add X axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + 35) //  y position inside the bottom margin
        .style("fill", "white")  //  text color here
        .text("Principal Component 1");




    // add Y axis
    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d["PCA2"]), d3.max(data, d => d["PCA2"])])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    
    // add Y axis label
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -35) // y position inside the left margin
        .attr("x", -height / 2)
        .style("fill", "white")  // text color here
        .text("Principal Component 2");

       

    // add dots
    const dots = dotsGroup.selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("cx", d => x(d["PCA1"]))
        .attr("cy", d => y(d["PCA2"]))
        .attr("r", 3.0)
        .style("fill", "#69b3a2")
        .style("opacity", 0.6);


  
    // hover interaction
    dots.on('mouseover', function(event, d) {
        d3.select(this).style("fill", "'#FF69B4'");
        highlightNodes([d['Src IP'], d['Dst IP']], true);
    });

    dots.on('mouseout', function(event, d) {
        d3.select(this).style("fill", "#69b3a2");
        highlightNodes([d['Src IP'], d['Dst IP']], false);
    });

        // click interaction with persistent highlighting
    dots.on('click', function(event, d) {
            // clear existing persistent highlights
        d3.selectAll('.persistent-highlight').classed('persistent-highlight', false);
    
            // persistent highlight class to the clicked dot
        d3.select(this).classed('persistent-highlight', true);
    
            // trigger node highlighting in the node-link diagram
        onNodeHighlight([d['Src IP'], d['Dst IP']], true);
    
            // display the details of the clicked data point
        displayDetails(d);
    });


}
