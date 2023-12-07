/**
 * Con-Viz - Copyleft
 */
// Scene setting
const WIDTH = window.innerWidth / 2.0;
const HEIGHT = window.innerHeight - 50;

// Set some camera attributes.
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 10000;

// Three.js objects
var HighlightActive = true
var controls;
var container;
var renderer;
var scene;
var camera;
var point_light;
var projector = new THREE.Projector();
headerSize = 60;

// Data
var nodes = {};
var edges = {};


// Id to nodes
var id_to_nodes = {};

// Node objects
node_objects = {};
edge_objects = {};

// Colors
node_colors = {};

// Brain Material
brain_material = new THREE.MeshLambertMaterial({color: 0x5555ff, transparent: true, opacity: 0.2, depthWrite: false});

// Events
var onNodeSelectedFunc;

/********************************************
 * FUNCTIONS
 ********************************************/

/**
 * Load brain model
 */
function load_brain(path)
{
  // instantiate a loader
  var loader = new THREE.OBJLoader();

  // load a resource
  loader.load(
  	// resource URL
  	path,
  	// called when resource is loaded
  	function(object)
    {
      object.scale.set(60.0, 60.0, 60.0);
      object.position.y -= 40;
      object.traverse(function(child) {
          if(child instanceof THREE.Mesh)
          {
              child.material = brain_material;
              child.geometry.computeVertexNormals();
          }
      });
  		scene.add(object);
  	},
  	// called when loading is in progresses
  	function ( xhr ) {
  	},
  	// called when loading has errors
  	function ( error ) {

  	}
  );
}

/**
 * Load data
 */
function load_data(surl)
{
  // Load JSON
  $.getJSON(surl, function(data)
  {
    // Nodes
    for(i=0; i<data.node.length; i++)
    {
      // Node
      node = data.node[i];

      // position
      node_x = parseFloat(node.dn_position_x.substring(1, node.dn_position_x.length-1)) - 57.75802802039638;
      node_z = parseFloat(node.dn_position_y.substring(1, node.dn_position_y.length-1)) - 55.00240079580239;
      node_y = parseFloat(node.dn_position_z.substring(1, node.dn_position_z.length-1)) - 40.10503904752529;

      // Update
      node.dn_position_x = node_x;
      node.dn_position_y = node_y;
      node.dn_position_z = node_z;

      // In dictionary
      nodes[node.id] = node;

    }

    // Edges
    for(i=0; i<data.edge.length; i++)
    {
      edge = data.edge[i];
      // In dico
      edges[i] = edge
    }

    // Init Scene
    init();

    // Update
    update();
  });
}

/**
 * Initialize the 3D scene
 */
function init()
{
  // Get the DOM element to attach to
  container = document.querySelector('#three_container');

  // Create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();

  // Background color
  renderer.setClearColor(0xffffff, 1);

  // A perspective camera
  camera = new THREE.PerspectiveCamera(
    VIEW_ANGLE,
    ASPECT,
    NEAR,
    FAR
  );

  // Scene
  scene = new THREE.Scene();

  // Orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // x,y,z. increase the camera height on the y axis
  camera.position.set(0, 80, 80);
  controls.update();

  // looks in the center of the scene since that where we always start when creating a scene. 0,0,0
  camera.lookAt(scene.position);

  // Add the camera to the scene.
  scene.add(camera);

  // Start the renderer.
  renderer.setSize(WIDTH, HEIGHT);

  // create a point light
  var point_light1 = new THREE.DirectionalLight(0xffffff);
  point_light1.position.set(0, 1, 0).normalize();

  // Directional light 2
  var point_light2 = new THREE.DirectionalLight(0xffffff);
  point_light2.position.set(0, 0, 1).normalize();
  point_light2.intensity = 0.5;

  // Directional light 4
  var point_light3 = new THREE.DirectionalLight(0xffffff);
  point_light3.position.set(1, 0, 0).normalize();

  // Directional light 3
  var point_light4 = new THREE.DirectionalLight(0xffffff);
  point_light4.position.set(-1, 0, 0).normalize();
  point_light4.intensity = 0.5;

  // add to the scene
  scene.add(point_light2);
  scene.add(point_light1);
  scene.add(point_light3);
  scene.add(point_light4);

  // Attach the renderer-supplied
  // DOM element.
  container.appendChild(renderer.domElement);

  // Load nodes
  load_nodes();

  // Load edges
  load_edges();
}

/**
 * Load edges
 */
function load_edges()
{
  // For each edges
  for(var edge_id in edges)
  {
    // Current edges
    edge = edges[edge_id];

    // Source and target
    source_node = nodes[edge.source];
    target_node = nodes[edge.target];

    // Material
    var material = new THREE.LineBasicMaterial({
    	// color: node_colors[edge.source],
      color: 0x444444,
      transparent: true,
      opacity: 0.1
    });

    // Line
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
    	new THREE.Vector3(source_node.dn_position_x, source_node.dn_position_y, source_node.dn_position_z),
    	new THREE.Vector3(target_node.dn_position_x, target_node.dn_position_y, target_node.dn_position_z)
    );
    var line = new THREE.Line(geometry, material);

    // Add to source node object
    if(source_node.edges == undefined)
    {
      source_node.edges = new Array();
    }
    source_node.edges.push(edge_id);

    // Add to scene
    scene.add(line);

    // Add to lists of edge
    edge_objects[edge_id] = line;
  }
}

/**
 * Load Nodes
 */
function load_nodes()
{
  // For each nodes
  for(var node_id in nodes)
  {
    // Current node
    node = nodes[node_id];

    // Position
    node_x = node.dn_position_x;
    node_y = node.dn_position_y;
    node_z = node.dn_position_z;

    // New meshes
    var geometry = new THREE.SphereGeometry(1, 5, 5);

    // Region
    node_region = node.dn_region

    // Color
    // node_colors[node_id] = 0.0;
    node_colors[node_id] = 0xbbbbee;
    /*while(node_colors[node_id] < Number.MAX_SAFE_INTEGER / 4.0)
    {
      node_colors[node_id] = Math.random() * Number.MAX_SAFE_INTEGER;
    }*/

    // New cube
    //var geometry = new THREE.BoxGeometry(3, 3, 3);
    var material = new THREE.MeshLambertMaterial({color: node_colors[node_id], transparent: true, opacity: 1.0});
    var new_node = new THREE.Mesh(geometry, material);

    // Position
    new_node.position.x = node_x;
    new_node.position.y = node_y;
    new_node.position.z = node_z;

    // Add to scene
    scene.add(new_node);

    // Add to objects
    node_objects[node_id] = new_node;
  }
}

/**
 * Called when there is an error
 */
function error_function(jqXHR, textStatus, errorThrown)
{
}

/**
 * Update display
 */
function update() {
  // Draw!
  renderer.render(scene, camera);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  // Schedule the next frame.
  requestAnimationFrame(update);
}

/**
 * Highlight region
 */

function highlightNode(dn_name, mode)
{
  // List of nodes to display
  displayed_nodes = {};
  for(var node_id in nodes)
  {
    displayed_nodes[node_id] = false;
  }
  // All edge not visible
  for(var edge_id in edge_objects)
  {
    edge_objects[edge_id].visible = false;
  }

  // Find node
  found = false;
  for(var node_id in nodes)
  {
    if(nodes[node_id].dn_name == dn_name)
    {
      found = true;
      highlight_node_id = node_id;
    }
  }

  // Not found
  if(!found)
  {
    return;
  }

  // Highlight target node
  displayed_nodes[highlight_node_id] = true;

  // Display each edges
  if (mode == 'all'){
  for(var edge_id in edges)
  {
    if(edges[edge_id].source == highlight_node_id || edges[edge_id] == highlight_node_id)
    {
      edge_objects[edge_id].visible = true;
      edge_objects[edge_id].material.opacity = 1.0;
      displayed_nodes[edges[edge_id].target] = true
      displayed_nodes[edges[edge_id].source] = true
    }
  }}
  if (mode == 'source'){
    for(var edge_id in edges)
    {
      if(edges[edge_id].source == highlight_node_id)
      {
        edge_objects[edge_id].visible = true;
        edge_objects[edge_id].material.opacity = 1.0;
        displayed_nodes[edges[edge_id].target] = true
      }
  }}
  if (mode == 'target'){
    for(var edge_id in edges)
    {
      if(edges[edge_id].target == highlight_node_id)
      {
        edge_objects[edge_id].visible = true;
        edge_objects[edge_id].material.opacity = 1.0;
        displayed_nodes[edges[edge_id].source] = true
      }
  }}
  // Change nodes opacity
  for(var node_id in node_objects)
  {
    if(displayed_nodes[node_id])
    {
      node_objects[node_id].material.opacity = 1.0;
    }
    else
    {
      node_objects[node_id].material.opacity = 0.2;
    }
  }
}
/**
 * On node selected
 */
function onNodeSelected(event_function)
{
  onNodeSelectedFunc = event_function;
}
/**********************************************
 * EVENTS
 **********************************************/
var textbox_1 = document.createElement('div');
textbox_1.id = 'node-text-box';
textbox_1.style.position = 'absolute';
textbox_1.style.backgroundColor = 'white'; 
textbox_1.style.border = 'none'; 
textbox_1.style.padding = '5px'; 
textbox_1.style.fontSize = '20px'; 
textbox_1.style.left = 180 + 'px';
textbox_1.style.top = 980 + 'px';

var textbox_2 = document.createElement('div');
textbox_2.id = 'fiber-density-box';
textbox_2.style.position = 'absolute';
textbox_2.style.backgroundColor = 'white'; 
textbox_2.style.border = 'none'; 
textbox_2.style.padding = '5px'; 
textbox_2.style.fontSize = '20px'; 
textbox_2.style.left = 180 + 'px';
textbox_2.style.top = 1020 + 'px';


var textbox_3 = document.createElement('div');
textbox_3.id = 'fiber-number-box';
textbox_3.style.position = 'absolute';
textbox_3.style.backgroundColor = 'white'; 
textbox_3.style.border = 'none'; 
textbox_3.style.padding = '5px'; 
textbox_3.style.fontSize = '20px'; 
textbox_3.style.left = 180 + 'px';
textbox_3.style.top = 1060 + 'px';

/**
 * Handle mouse motions
 */


function mouseMove(event)
{
  // DOM domElement
  container_element = renderer.domElement;

  // Vector
	var vector = new THREE.Vector3(
		(event.clientX / container_element.offsetWidth) * 2 - 1,
		-((event.clientY-headerSize) / (window.innerHeight-headerSize)) * 2 + 1,
		0.5
	);
	// projector.unprojectVector(vector, camera);
  vector.unproject(camera);

	// Ray
	var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

	// Intersect
	var intersects = ray.intersectObjects(Object.values(node_objects));
  if (HighlightActive){
	// Intersect with POI objects?
	if(intersects.length > 0)
	{
		// Search the object
		for(var node_id in nodes)
		{
			// This object?
      if(node_objects[node_id] == intersects[0].object)
      {
        // Highlight node
        highlightNode(nodes[node_id].dn_name, 'all');
        d3.select('.source.' + nodes[node_id].dn_name.replace(/\"/g, '').replace(/\./g, '_')).style('fill', '#adadfd');
        d3.select('.target.' + nodes[node_id].dn_name.replace(/\"/g, '').replace(/\./g, '_')).style('fill', '#adadfd');
          textbox_1.innerText = nodes[node_id].dn_fsname.replace(/"/g, '');
          textbox_1.style.display = 'block'; // Show the text box
          document.body.appendChild(textbox_1);
      // Update text box content and position 
        // Callback
        if(onNodeSelectedFunc != undefined)
        {
          onNodeSelectedFunc(nodes[node_id].dn_name);
        }

        // Stop
        break;
      }
		}
	}
  else {
    // Each node visible (opacity 1.0)
		for(var node_id in node_objects)
		{
      node_objects[node_id].material.opacity = 1.0;
      d3.select('.source.' + nodes[node_id].dn_name.replace(/\"/g, '').replace(/\./g, '_')).style('fill', '#dbdbf9');
      d3.select('.target.' + nodes[node_id].dn_name.replace(/\"/g, '').replace(/\./g, '_')).style('fill', '#dbdbf9');
      textbox_1.style.display = 'none'

    }

    // Each edge at standard opacity (0.2)
    for(var edge_id in edge_objects)
    {
      edge_objects[edge_id].visible = true;
      edge_objects[edge_id].material.opacity = 0.1;
    }
  }}
}

/********************************************
 * MAIN
 ********************************************/

// A $( document ).ready() block.


//Chart begin
const Scales = {
  linear: (min_val, max_val, start_val, end_val) => {
      return d3.scaleLinear()
      .range([start_val, end_val])
      .domain([min_val, max_val])
      .nice();
      },
  band: (node_name, start_node, end_node) => {
      return d3.scaleBand()
      .range([start_node, end_node])
      .domain(node_name);
  }
}

var node_arr = []
var edge_arr = [] 

$.getJSON("data/dwi_scale1.json", function(data) {
  for(let i = 0; i < data.node.length; i++) {
    let node = data.node[i];
    node_arr.push({'id': node.id-1, 'name': node.dn_name.replace(/"/g, ''), 'source_count': 0, 'target_count': 0});
    }
    console.log('Node_arr: ',node_arr)
  for(let j = 0; j < data.edge.length; j++) {
    let edge = data.edge[j];
    node_arr[edge.source-1].source_count += 1
    node_arr[edge.target-1].target_count += 1
    edge_arr.push({'id': edge.id, 'source':edge.source-1, 'target':edge.target-1, 'number_of_fibers':edge.number_of_fibers,'fiber_density': edge.fiber_density, 'fiber_length_mean': edge.fiber_length_mean})
    }
    console.log('Edge_arr: ',edge_arr)
  function highlightBars(nodeName) {
    d3.select('.source.' + nodeName).style('fill', '#adadfd');
    d3.select('.target.' + nodeName).style('fill', '#adadfd');
  }
  function lowlightBars(nodeName) {
    d3.select('.source.' + nodeName).style('fill', '#dbdbf9');
    d3.select('.target.' + nodeName).style('fill', '#dbdbf9');
}
    // source bar chart
    var source_bar = d3.select('#source_bar')  
    .attr("width", 700)
    .attr("height", 200)
    .append("g")
    .attr("transform", "translate(0,0)")
    margin = {top: 50, right: 20, bottom: 20, left: 50},
    width = 650 - margin.left - margin.right,
    height = 180 - margin.top - margin.bottom;
    node_arr.sort((a, b) => b.source_count - a.source_count)
    const xScale_source = Scales.band(node_arr.map(d => d.name), 0, width);
    const yScale_source = Scales.linear(0, d3.max(node_arr, d=> d.source_count), height, 0);
    let xAxis_source = d3.axisBottom(xScale_source)
    let yAxis_source = d3.axisLeft(yScale_source).ticks(10)
    let sourceChartLayer = source_bar.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top +")");
    sourceChartLayer.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(${0}, ${height+2})`)
    .call(xAxis_source)
    .selectAll('text')
    .remove()
    sourceChartLayer.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${-1.5}, ${0})`)
    .call(yAxis_source)
    sourceChartLayer.append('g')
    .attr('class', 'axis-lable')
    .attr('transform',  `translate(${160}, ${-20})`)
    .append('text')
    .style('text-anchor', 'middle')
    .text('Number of outward projections from the node')
    .style('font-size', '16px')  
    .style('font-weight', 'bold') 
    sourceChartLayer.selectAll('.bar')
    .data(node_arr)
    .enter().append('rect')
    .attr('class', d => `source ${d.name.replace(/\./g, '_')}`)
    .attr('x', d => xScale_source(d.name))
    .attr('y', d => yScale_source(d.source_count))
    .attr('width', xScale_source.bandwidth())
    .attr('height', d => {return height-yScale_source(d.source_count);})
    .style("fill", '#dbdbf9')
    .style("stroke", "white")
    .style("stroke-width", 2)
    .on('mouseover', function(){
      HighlightActive = false
      let nodeName = this.getAttribute('class').substring(7);
      highlightBars(nodeName);
      highlightNode('"'+nodeName.replace(/\_/g, '.')+'"', 'source')
      textbox_1.innerText = nodeName
      textbox_1.style.display = 'block'; // Show the text box
      document.body.appendChild(textbox_1);

      nodeid = node_arr.find(node => node.name ==  nodeName.replace(/\_/g, '.')).id;
      d3.select("#node_selector").property("value", nodeid);
      updateVisualization(nodeid)
      HighlightConnectedRibbons(nodeid)

    })
    .on('mouseout', function(d){
      HighlightActive = true
      let nodeName = this.getAttribute('class').substring(7);
      lowlightBars(nodeName)
      textbox_1.style.display = 'none';
      for(var node_id in node_objects)
      {
        node_objects[node_id].material.opacity = 1.0;
        textbox_1.style.display = 'none'
  
      }
  
      // Each edge at standard opacity (0.2)
      for(var edge_id in edge_objects)
      {
        edge_objects[edge_id].visible = true;
        edge_objects[edge_id].material.opacity = 0.1;
      }
    })


    // target bar chart
    var target_bar = d3.select('#target_bar')  
    .attr("width", 700)
    .attr("height", 200)
    .append("g")
    .attr("transform", "translate(0,0)")
    node_arr.sort((a, b) => b.target_count - a.target_count)
    const xScale_target = Scales.band(node_arr.map(d => d.name), 0, width);
    const yScale_target = Scales.linear(0, d3.max(node_arr, d=> d.target_count), height, 0);
    let xAxis_target = d3.axisBottom(xScale_target)
    let yAxis_target = d3.axisLeft(yScale_target).ticks(10)
    let targetChartLayer = target_bar.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top +")");
    targetChartLayer.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(${0}, ${height+2})`)
    .call(xAxis_target)
    .selectAll('text')
    .remove()
    targetChartLayer.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${-1.5}, ${0})`)
    .call(yAxis_target)
    targetChartLayer.append('g')
    .attr('class', 'axis-lable')
    .attr('transform',  `translate(${140}, ${-20})`)
    .append('text')
    .style('text-anchor', 'middle')
    .text('Number of inward projetions to the node')
    .style('font-size', '16px')  
    .style('font-weight', 'bold') 
    targetChartLayer.selectAll('.bar')
    .data(node_arr)
    .enter().append('rect')
    .attr('class', d=>`target ${d.name.replace(/\./g, '_')}`)
    .attr('x', d => xScale_target(d.name))
    .attr('y', d => yScale_target(d.target_count))
    .attr('width', xScale_source.bandwidth())
    .attr('height', d => {return height-yScale_target(d.target_count);})
    .style("fill", '#dbdbf9')
    .style("stroke", "white")
    .style("stroke-width", 2)
    .on('mouseover', function(){

      HighlightActive = false
      
      let nodeName = this.getAttribute('class').substring(7);
      highlightBars(nodeName);
      highlightNode('"'+nodeName.replace(/\_/g, '.')+'"', 'target')
      textbox_1.innerText = nodeName
      textbox_1.style.display = 'block'; // Show the text box
      document.body.appendChild(textbox_1);

      nodeid = node_arr.find(node => node.name ==  nodeName.replace(/\_/g, '.')).id;
      d3.select("#node_selector").property("value", nodeid);
      updateVisualization(nodeid)
      HighlightConnectedRibbons(nodeid)
      
    })
    .on('mouseout', function(d){
      HighlightActive = true
      let nodeName = this.getAttribute('class').substring(7).replace(/\./g, '_');
      lowlightBars(nodeName)
      textbox_1.style.display = 'none';
      for(var node_id in node_objects)
      {
        node_objects[node_id].material.opacity = 1.0;
        textbox_1.style.display = 'none'
      }
      // Each edge at standard opacity (0.2)
      for(var edge_id in edge_objects)
      {
        edge_objects[edge_id].visible = true;
        edge_objects[edge_id].material.opacity = 0.1;
      }
      ResetRibbonHighlights()
    })

    // begin edge info
    var node_selector = d3.select("#node_selector"); // selector
    node_selector
    .selectAll("option")
    .data(node_arr)
    .enter()
    .append("option")
    .text(function(d) { return d.name;})
    .attr("value", function(d){ return d.id;});




//new network///////////////////////////////////
node_arr.sort((a, b) => a.id - b.id)
const svg2 = d3.select('#network')
    .attr('width', 800)
    .attr('height', 576)
    .append('g')
    .attr('transform', `translate(${400},${288})`);
  
  // Fixed radius for all new_nodes
const newNodeRadius = 30; // adjust this value as needed
  
  // Draw the new_nodes

  const placementRadius = 280; // Adjusted for the 800x800 size

  const innerRadius = placementRadius - newNodeRadius;
  const outerRadius = placementRadius;
  const ribbon = d3.ribbon().radius(innerRadius);
  
  // Transform edge array to matrix for chord diagram
  const matrix = Array.from({length: node_arr.length}, () => new Array(node_arr.length).fill(0));
  edge_arr.forEach(edge => {
    // Populate the matrix with fiber_density or number_of_fibers
    matrix[edge.source][edge.target] = parseFloat(edge.fiber_density.replace(/"/g, ''));
    matrix[edge.target][edge.source] = parseFloat(edge.fiber_density.replace(/"/g, ''));

  });
  console.log(matrix)

  const maxDensity = d3.max(edge_arr, d => {
    const cleanedString = d.fiber_density.replace(/"/g, ''); // Removes all quotation marks
    return parseFloat(cleanedString);
  });


  const maxConnections = d3.max(node_arr, d => parseInt(d.source_count) + parseInt(d.target_count));
  const arcColor = d3.scaleLinear()
      .domain([0, maxConnections])
      .range(['lightblue', 'steelblue']); 

  console.log(83/innerRadius)
  const chords = d3.chord().padAngle(0.05)(matrix)
  console.log('chords: ',chords)
  // Compute the chord layout from the matrix
  // Draw the chords (links)
    svg2.append('g')
    .selectAll('path')
    .data(chords)
    .enter().append('path')
    .attr('d', d => ribbon(d))
    .attr('class', d => 'ribbons ' + d.source.index + ' '+ d.target.index)
    .style('fill','#dbdbf9')
    .style('opacity', 0.1)
    .style('stroke', '#dbdbf9')
    .style('stroke-width', 1)  

  const arc = d3.arc()
  .innerRadius(innerRadius)
  .outerRadius(outerRadius);

  const hoverOuterRadius = outerRadius + 10; // Adjust this value as needed

  const arcHover = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(hoverOuterRadius);

  const nodeArcs = svg2.append('g')
    .selectAll('g')
    .data(chords.groups)
    .enter().append('g');

    function HighlightConnectedRibbons(nodeid) {
      // Highlight all ribbons connected to the hovered node
      svg2.selectAll('.ribbons')
          .style('opacity', 0); // Dim all ribbons first
      svg2.selectAll('.ribbons')
          .filter(function() {
              let source = this.getAttribute('class').split(' ')[1]; // Get the second class name
              let target = this.getAttribute('class').split(' ')[2]
              return source == nodeid || target == nodeid;
          })
          .style('opacity', 1); // Highlight only the connected ribbons
  }
  console.log('chords groups: ',chords.groups)
  function ResetRibbonHighlights() {
      // Reset the ribbons to their normal opacity
      svg2.selectAll('.ribbons')
          .style('opacity', 0.1);
  }

  nodeArcs.append('path')
    .attr('d', arc)
    .style('fill', '#8484a1')
    .attr('class', d => 'arc-' + node_arr[d.index].id)
    .style('stroke', 'transparent') // Make the stroke transparent
    .style('stroke-width', 20) 
    .on('mouseover', function(d) {
      HighlightActive = false
      let nodeid = this.getAttribute('class').substring(4);
      nodeName = node_arr[nodeid].name
      highlightBars(nodeName.replace(/\./g, '_'));
      highlightNode('"'+nodeName.replace(/\_/g, '.')+'"', 'target')
      d3.select("#node_selector").property("value", nodeid);
      updateVisualization(parseInt(nodeid))
      textbox_1.innerText = nodeName
      textbox_1.style.display = 'block';
      document.body.appendChild(textbox_1);
      textbox_2.innerText = 'Total connections count: ' + (parseInt(node_arr[nodeid].source_count) + parseInt(node_arr[nodeid].target_count))
      textbox_2.style.display = 'block';
      document .body.appendChild(textbox_2);
      d3.select(this).transition().attr('d', arcHover);
      HighlightConnectedRibbons(nodeid);

      // Highlight the connected ribbons
    })
    .on('mouseleave', function() {
      for(var edge_id in edge_objects)
      {
        edge_objects[edge_id].visible = true;
        edge_objects[edge_id].material.opacity = 0.1;
      }
      for(var node_id in node_objects)
      {
        node_objects[node_id].material.opacity = 1.0;
      }
      lowlightBars(nodeName.replace(/\./g, '_'))
      textbox_1.style.display = 'none'
      textbox_2.style.display = 'none'
      textbox_3.style.display = 'none'
      d3.select(this).transition().attr('d', arc);
      ResetRibbonHighlights()
    });

//new network///////////////////////////////////
// Create the SVG container
const svg = d3.select('#edge_info')
    .attr('width', 1000)
    .attr('height', 300)
    .append('g')
    .attr('transform', `translate(${-300},${0})`);

// Function to update the visualization
function updateVisualization(selectedNodeId) {
  // Filter the data based on the selected node
  const firstLayerLinks = edge_arr.filter(d => d.target === selectedNodeId);
  const thirdLayerLinks = edge_arr.filter(d => d.source === selectedNodeId);

  // Calculate positions
  const firstLayerPositions = calculateNodePosition(firstLayerLinks.map(d => ({ id: d.source })), 0, 3);
  const thirdLayerPositions = calculateNodePosition(thirdLayerLinks.map(d => ({ id: d.target })), 2, 3);
  const secondLayerPosition = { x: 1350 / 2, y: 280 / 2 }; // Center node

  // Clear the previous visualization
  svg.selectAll('*').remove();
  // Draw first layer links and nodes
  drawLinksAndNodes(firstLayerPositions, secondLayerPosition, selectedNodeId, edge_arr,'1st');
  drawLinksAndNodes(thirdLayerPositions, secondLayerPosition, selectedNodeId, edge_arr,'3rd');
  drawSingleNode(secondLayerPosition, selectedNodeId, edge_arr ,'2nd');
}
  node_arr.sort((a, b) => a.id - b.id)
// Function to draw links and nodes
function drawLinksAndNodes(nodePositions, centerNodePosition, centerNodeId, edge_arr, layerPrefix) {
  // Draw links
  nodePositions.forEach(pos => {
    svg.append('line')
      .attr('x1', centerNodePosition.x)
      .attr('y1', centerNodePosition.y)
      .attr('x2', pos.x)
      .attr('y2', pos.y)
      .attr('class', `link ${centerNodeId} ${pos.id}`)
      .style('stroke', '#dbdbf9')
      .style('stroke-width', 2)
      .on('mouseover', function() {
        d3.select(this).style('stroke', '#adadfd').style('stroke-width', 4);
        int_list = this.getAttribute('class').match(/\d+/g)

        if (layerPrefix == '1st'){
          source_id = parseInt(int_list[1], 10)
          target_id = parseInt(int_list[0], 10)
        }
        else {
          source_id = parseInt(int_list[0], 10)
          target_id = parseInt(int_list[1], 10)
        }
        source_name = node_arr[source_id].name.replace(/\-/g, '_')
        target_name = node_arr[target_id].name.replace(/\-/g, '_')
        const edge = edge_arr.find(e => e.source == source_id && e.target == target_id) ||
                     edge_arr.find(e => e.target == source_id && e.source == target_id);
        textbox_1.innerText = source_name + ' to ' + target_name
        textbox_1.style.display = 'block';
        document.body.appendChild(textbox_1);
        textbox_2.innerText = 'Fiber density: ' + edge.fiber_density
        textbox_2.style.display = 'block';
        document.body.appendChild(textbox_2);
        textbox_3.innerText = 'Number of fibers: ' + edge.number_of_fibers
        textbox_3.style.display = 'block';
        document.body.appendChild(textbox_3);

        for (var edge_id in edges) {
          // Check if both conditions are true
          if (edges[edge_id].source == source_id+1 && edges[edge_id].target == target_id+1) {
            edge_objects[edge_id].visible = true;
            edge_objects[edge_id].material.opacity = 1;
          }
          else{
            edge_objects[edge_id].visible = false;
          }
        }
        for(var node_id in node_objects)
        {
          if(node_id == source_id + 1 || node_id == target_id + 1)
          {
            node_objects[node_id].material.opacity = 1.0;
          }
          else
          {
            node_objects[node_id].material.opacity = 0.2;
          }
        }
      })
      .on('mouseout', function() {
        d3.select(this).style('stroke', '#dbdbf9').style('stroke-width', 2);
        textbox_1.style.display = 'none';
        for(var edge_id in edge_objects)
        {
          edge_objects[edge_id].visible = true;
          edge_objects[edge_id].material.opacity = 0.1;
        }
        for(var node_id in node_objects)
        {
          node_objects[node_id].material.opacity = 1.0;
          textbox_1.style.display = 'none'
          textbox_2.style.display = 'none'
          textbox_3.style.display = 'none'
        }
      });
  });

  // Draw nodes
  nodePositions.forEach(pos => {
    svg.append('circle')
      .attr('cx', pos.x)
      .attr('cy', pos.y)
      .attr('r', 3)
      .attr('class', `node ${layerPrefix} ${pos.id}`)
      .style('fill', '#8484a1')
      .on('mouseover', function() {
        HighlightActive = false
        d3.select(this).style('fill', '#adadfd').attr('r', 5);
        selectid = parseInt(this.getAttribute('class').substring(9),10)
        selectname = node_arr[selectid].name
        highlightBars(selectname.replace(/\./g, '_'));
        textbox_1.innerText = selectname
        textbox_1.style.display = 'block'; // Show the text box
        document.body.appendChild(textbox_1);
        for(var node_id in node_objects)
        {
          if(node_id == selectid + 1)
          {
            node_objects[node_id].material.opacity = 1.0;
          }
          else
          {
            node_objects[node_id].material.opacity = 0.2;
          }
        }
      })
      .on('mouseout', function() {
        HighlightActive = true
        d3.select(this).style('fill', '#8484a1').attr('r', 3);
        selectname = node_arr[this.getAttribute('class').substring(9)].name
        lowlightBars(selectname.replace(/\./g, '_'))
        textbox_1.style.display = 'none';
        for(var node_id in node_objects)
        {
          node_objects[node_id].material.opacity = 1.0;
          textbox_1.style.display = 'none'
        }
      });
  });
}

// Function to draw a single node with hover effects and a unique class
function drawSingleNode(position, centerNodeId,  edge_arr, layerPrefix) {
  svg.append('circle')
    .attr('cx', position.x)
    .attr('cy', position.y)
    .attr('r', 8)
    .attr('class', `node ${layerPrefix} ${centerNodeId}`)
    .style('fill', '#8484a1').raise()
    .on('mouseover', function() {
      HighlightActive = false
      d3.select(this).style('fill', '#adadfd').attr('r', 12);
      selectid = parseInt(this.getAttribute('class').substring(9),10)
      selectname = node_arr[selectid].name
      highlightBars(selectname.replace(/\./g, '_'));
      textbox_1.innerText = selectname
      textbox_1.style.display = 'block'; // Show the text box
      document.body.appendChild(textbox_1);
      for(var node_id in node_objects)
      {
        if(node_id == selectid + 1)
        {
          node_objects[node_id].material.opacity = 1.0;
        }
        else
        {
          node_objects[node_id].material.opacity = 0.2;
        }
      }
    })
    .on('mouseout', function() {
      d3.select(this).style('fill', '#8484a1').attr('r', 8);
      HighlightActive = true
      selectname = node_arr[this.getAttribute('class').substring(9)].name
      lowlightBars(selectname.replace(/\./g, '_'))
      textbox_1.style.display = 'none';
      for(var node_id in node_objects)
      {
        node_objects[node_id].material.opacity = 1.0;
        textbox_1.style.display = 'none'
      }
    });
}
// Calculate node positions for each layer
function calculateNodePosition(nodes, layerIndex, totalLayers) {
  const layerWidth = 1000 / totalLayers;
  const nodeSpacing = 280 / (nodes.length + 1);

  return nodes.map((node, index) => {
    return {
      id: node.id,
      x: layerWidth * (layerIndex + 1), // Center nodes in the middle of the layer
      y: (index + 1) * nodeSpacing // Space nodes evenly along the height
    };
  });
}
// Add an event listener to the node selector
d3.select("#node_selector").on("change", function() {
  const selectedNodeId = +d3.select(this).property("value");
  updateVisualization(selectedNodeId);
});
// Call the update function initially if you want to show a default node selection
updateVisualization(75);
  });
$(document).ready(function() {
  // Load Data
  load_data("data/dwi_scale1.json")
  // Load brain model
  load_brain("data/Brain_Model.obj");
  // Events
  $("#three_container").mousemove(mouseMove);
});


const placeholer = d3.select('#placeholer')
    .attr('width', 800)
    .attr('height', 1000)