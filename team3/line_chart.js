const countryClubsMapping = {
    "United Kingdom": ["Manchester City","Manchester United","Liverpool FC","Arsenal FC","Chelsea FC"],
    "Germany": ["Bayern Munich","Borussia Dortmund","Bayer 04 Leverkusen","RB Leipzig","Borussia Mönchengladbach"],
    "Netherlands": ["Ajax Amsterdam","PSV Eindhoven","Feyenoord Rotterdam","FC Utrecht","AZ Alkmaar"],
    "Portugal": ["FC Porto","SL Benfica","Sporting CP","SC Braga","Vitória Guimarães SC"],
    "France": ["Paris Saint-Germain","Olympique Marseille","Olympique Lyon","AS Monaco","LOSC Lille"],
    "Russia": ["Spartak Moscow","Zenit St. Petersburg","CSKA Moscow","Lokomotiv Moscow","FK Krasnodar"],
    "Spain": ["Real Madrid","FC Barcelona","Atlético de Madrid","Sevilla FC","Valencia CF"],
    "Italy": ["Juventus FC","Inter Milan","AC Milan","AS Roma","SSC Napoli"]
  };

  const chartWidth = 1200;
        const chartHeight = 800;
        const margin = { top: 20, right: 70, bottom: 50, left: 100 };
        const width = chartWidth - margin.left - margin.right;
        const height = chartHeight - margin.top - margin.bottom;

        const svg = d3.select("#chart-container")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .style("margin-left", "90px")
            .style("background-image", "url('images/linebg.jpeg')") 
            .style("background-size", "cover")
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

            

  window.addEventListener('sharedDataChanged', function() {
    const selectedCountry = window.sharedData.value;

    

    svg.selectAll("*").remove();

    d3.csv('./top5_spend.csv').then(function(spendingData) {
        d3.csv('./top5_wins.csv').then(function(winsData) {
            
            const clubs = countryClubsMapping[selectedCountry];

            const dropdown = d3.select("#clubDropdown");
            dropdown.selectAll("option").remove();


            dropdown.selectAll("option")
                .data(clubs)
                .enter().append("option")
                .text(d => d)
                .attr("value", d => d);

            const initialClub = clubs[0];
            dropdown.property("value", initialClub); 
            const selectedClub = initialClub;
        const combinedData = clubs
          .filter(club => club === selectedClub)
          .map(club => {
            const clubSpending = spendingData.map(d => ({ year: d.Year, value: +d[club] }));
            const clubWins = winsData.map(d => ({ year: d.year, value: +d[club] }));

            return {
              club,
              spending: clubSpending,
              wins: clubWins
            };
          });


    const years = spendingData.map(d => d.Year);

    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.1);

    const yScaleSpending = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d3.max(d.spending, s => s.value))])
        .nice()
        .range([height, 0]);

    const yScaleWins = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d3.max(d.wins, w => w.value))])
        .nice()
        .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxisSpending = d3.axisLeft(yScaleSpending).ticks(10);
    const yAxisWins = d3.axisRight(yScaleWins).ticks(10);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxisSpending)
        .attr("class", "axis-spending");

    svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(yAxisWins)
        .attr("class", "axis-wins");

    const lineSpending = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScaleSpending(d.value));

    const lineWins = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScaleWins(d.value));

        svg.selectAll(".line-spending")
        .data(combinedData)
        .enter().append("path")
        .attr("class", "line-spending")
        .attr("d", d => lineSpending(d.spending))
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    

    svg.selectAll(".line-wins")
        .data(combinedData)
        .enter().append("path")
        .attr("class", "line-wins")
        .attr("d", d => lineWins(d.wins))
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 20)
        .attr("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Euros (€)");

        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", width + 30)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Number of Wins");

    

    const legend = svg.append("g")
    .attr("transform", `translate(${width - 120}, 0)`);

legend.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 20)
    .attr("y2", 0)
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");

legend.append("text")
    .attr("x", 25)
    .attr("y", 0)
    .attr("dy", "0.32em")
    .style("font-size", "10px")
    .text("Wins");

legend.append("line")
    .attr("x1", 0)
    .attr("y1", 15)
    .attr("x2", 20)
    .attr("y2", 15)
    .attr("stroke", "black")
    .attr("stroke-width", 2);

legend.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .attr("dy", "0.32em")
    .style("font-size", "10px")
    .text("Spending");
            
            

    dropdown.on("change", function() {
      const selectedClub = dropdown.property("value");
      svg.selectAll("*").remove();
      const combinedData = clubs
          .filter(club => club === selectedClub)
          .map(club => {
            const clubSpending = spendingData.map(d => ({ year: d.Year, value: +d[club] }));
            const clubWins = winsData.map(d => ({ year: d.year, value: +d[club] }));

            return {
              club,
              spending: clubSpending,
              wins: clubWins
            };
          });


    const years = spendingData.map(d => d.Year);

    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .padding(0.1);

    const yScaleSpending = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d3.max(d.spending, s => s.value))])
        .nice()
        .range([height, 0]);

    const yScaleWins = d3.scaleLinear()
        .domain([0, d3.max(combinedData, d => d3.max(d.wins, w => w.value))])
        .nice()
        .range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    const yAxisSpending = d3.axisLeft(yScaleSpending).ticks(10);
    const yAxisWins = d3.axisRight(yScaleWins).ticks(10);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .call(yAxisSpending)
        .attr("class", "axis-spending");

    svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(yAxisWins)
        .attr("class", "axis-wins");

    const lineSpending = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScaleSpending(d.value));

    const lineWins = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScaleWins(d.value));

        svg.selectAll(".line-spending")
        .data(combinedData)
        .enter().append("path")
        .attr("class", "line-spending")
        .attr("d", d => lineSpending(d.spending))
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    

    svg.selectAll(".line-wins")
        .data(combinedData)
        .enter().append("path")
        .attr("class", "line-wins")
        .attr("d", d => lineWins(d.wins))
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 20)
        .attr("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Euros (€)");

        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", width + 30)
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Number of Wins");

    

    const legend = svg.append("g")
    .attr("transform", `translate(${width - 120}, 0)`);

legend.append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 20)
    .attr("y2", 0)
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");

legend.append("text")
    .attr("x", 25)
    .attr("y", 0)
    .attr("dy", "0.32em")
    .style("font-size", "10px")
    .text("Wins");

legend.append("line")
    .attr("x1", 0)
    .attr("y1", 15)
    .attr("x2", 20)
    .attr("y2", 15)
    .attr("stroke", "black")
    .attr("stroke-width", 2);

legend.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .attr("dy", "0.32em")
    .style("font-size", "10px")
    .text("Spending");
});
});
    });
    
            



        
  });