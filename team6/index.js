// index.js
import { createScatterPlot } from './scatterPlot.js';
import { createNodeLink } from './nodeLink.js';

// function to display details in a table
function displayDetails(dataPoint) {
    const detailsDiv = document.getElementById('detailsDiv');
    detailsDiv.innerHTML = ''; // clear previous details
  
    const excludeKeys = ['PCA1', 'PCA2', 'Cluster', 'index', 'Flow ID', 
    'Timestamp','Fwd PSH Flags', 'FIN Flag Count', 'SYN Flag Count',
    'RST Flag Count', 'Down/Up Ratio', 'Bwd Bulk Rate Avg'];
  
    const table = document.createElement('table');
    Object.keys(dataPoint).forEach(key => {
      if (!excludeKeys.includes(key)) { // check if key is not in the exclude list
        let row = table.insertRow();
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        cell1.textContent = key;
        cell2.textContent = dataPoint[key];
      }
    });
    detailsDiv.appendChild(table);
  }
  

d3.json("./final_data.json").then(function(data) {
    if (data && Array.isArray(data)) {
        // create the node-link diagram and provide the highlighting function
        createNodeLink(data, 'nodeLinkContainer', (highlightCallback) => {
            // Create the scatter plot and pass the necessary callbacks
            createScatterPlot(data, 'scatterPlotContainer', highlightCallback, displayDetails);
        });
    } else {
        console.error("Data is not in expected format");
    }
}).catch(function(error) {
    console.error("Error loading the data:", error);
});
