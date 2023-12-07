// NodeLink.js

import { processDataForNodeLink } from './utils.js';

export function createNodeLink(data, containerId, highlightNodesCallback) {

    const { nodes, links } = processDataForNodeLink(data);

    
 // make this function available for scatterPlot.js to use!
    highlightNodesCallback((nodeIds, shouldHighlight) => {
        node.style('fill', d => nodeIds.includes(d.id) && shouldHighlight ? 'red' : '#69b3a2');
    });
    
    function isConnected(a, b) {
        return linkedByIndex[`${a.index},${b.index}`] || a.index === b.index;
    }

    function forceBoundary(width, height) {
        const padding = 50; // Space from the boundary
        return function force(alpha) {
            nodes.forEach(d => {
                if (d.x < padding) d.x += (padding - d.x) * alpha;
                if (d.x > width - padding) d.x -= (d.x - (width - padding)) * alpha;
                if (d.y < padding) d.y += (padding - d.y) * alpha;
                if (d.y > height - padding) d.y -= (d.y - (height - padding)) * alpha;
            });
        };
    }

    const svg = d3.select(`#${containerId}`).append('svg')
        .attr('width', 900)
        .attr('height', 700)
        .call(d3.zoom().on("zoom", (event) => {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100)) // Control link distance
        .force('charge', d3.forceManyBody().strength(-50)) // Reduce the strength of node repulsion
        .force('center', d3.forceCenter(900 / 2, 700 / 2)) // Centering force
        .force('boundary', forceBoundary(900, 700)) // Custom force to keep nodes inside SVG
        .force('x', d3.forceX(900/2).strength(.2))
        .force('y', d3.forceY(700/2).strength(.2));
    // Map to store links for quick lookup
    const linkedByIndex = {};
    links.forEach(link => {
        linkedByIndex[`${link.source.index},${link.target.index}`] = 1;
        linkedByIndex[`${link.target.index},${link.source.index}`] = 1;
    });

    // Calculate the number of links for each node
    nodes.forEach(node => {
        node.linkCount = links.reduce((count, link) => {
            return count + (link.source === node || link.target === node);
        }, 0);
    });


    const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', d => Math.sqrt(d.value));


    const node = svg.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', d => 5 + d.linkCount * .005) // Bigger nodes for those with more links
        .attr('fill', '#69b3a2') // Initial color
        .call(drag(simulation));



    node.on('click', function(event, clickedNode) {
        node.style('fill', node => isConnected(clickedNode, node) ? '#FF69B4' : '#69b3a2');
    });

    function isConnected(a, b) {
        return linkedByIndex[`${a.index},${b.index}`] || a.index === b.index;
    }



    node.on('mouseover', function(event, d) {
        // Apply force to move nodes away from the cursor
        simulation.force('charge', d3.forceManyBody().strength(node => node === d ? -100 : -20));
        simulation.alphaTarget(0.3).restart();
    });

    node.on('mouseout', function() {
        // Reset the force
        simulation.force('charge', d3.forceManyBody().strength(-20));
        simulation.alphaTarget(0);
    });

    node.append('title')
        .text(d => d.id);

    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    });

   

    function drag(simulation) {
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended);
    }
}
