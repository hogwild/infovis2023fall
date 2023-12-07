// utils.js
export function processDataForScatterPlot(data) {
    // Processing specific to scatter plot
    return processedData;
}

export function processDataForNodeLink(data) {
    let nodeMap = new Map();
    let links = [];

    // Process data to create nodes and links
    data.forEach(item => {
        if (!nodeMap.has(item['Src IP'])) {
            nodeMap.set(item['Src IP'], { id: item['Src IP'], group: item.Cluster });
        }
        if (!nodeMap.has(item['Dst IP'])) {
            nodeMap.set(item['Dst IP'], { id: item['Dst IP'], group: item.Cluster });
        }
        links.push({ source: item['Src IP'], target: item['Dst IP'], value: 1 });
    });

    let nodes = Array.from(nodeMap.values());

    return { nodes, links };
}

