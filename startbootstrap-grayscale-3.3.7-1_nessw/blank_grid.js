blank_grid();

function blank_grid() {
	var svg = d3.select('#chart1');
	svg.selectAll("*").remove();
	
	gData = gridData();
	
	//Function to call when you mouseover a node
	function mover(d) {
	  var el = d3.select(this)
			.transition()
			.duration(10)		  
			.style("fill-opacity", 0.3)
			;
	}

	//Mouseout function
	function mout(d) { 
		var el = d3.select(this)
		   .transition()
		   .duration(1000)
		   .style("fill-opacity", 1)
		   ;
	};
				
	var margin = {top: 50, right: 0, bottom: 100, left: 30 },
		width = 500, height = 470, rows = 47, cols = 50, cellSize = 10,
		radius = 10;
		
	var svg = d3.select('#chart1')
		.append("svg")
		.attr("width",width + margin.left + margin.right)
		.attr("height",height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		;

	svg.append("svg:image")
		.attr("xlink:href", "file:///C:/JavaCode/DIVA/nbahalfcourt.png")
		.attr("width", width)
		.attr("height", height)
		;
					  
	var grid = svg.selectAll("rect")
		.data(gData)
		.enter().append("g").append("rect")
		.attr("width", cellSize)
		.attr("height", cellSize)
		.attr("y", function (d) { return d.y; })
		.attr("x", function (d) { return d.x; })
		.style("fill", "black")
		.style("opacity", ".4")
		.on("mouseover", mover)
		.on("mouseout", mout)
		;
	
		
	//svg.append("svg:image")
	//	.attr("xlink:href", "file:///C:/JavaCode/DIVA/nbahalfcourt.png")
	//	.attr("width", width)
	//	.attr("height", height - 15);
	
	/*var pData = playerData(off_locs, def_locs);

	var off_circles = svg.selectAll('circle')
		.data(pData)
		.enter().append('g').append('circle')
		.attr("r", radius)
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; })
		.style("fill", "none")
		.style("stroke", function (d,i) { return playerColors[i]; })
		.style("stroke-width", 1)
		;
	
	var initials = svg.selectAll("text")
		.data(pData)
		.enter().append('g').append("text")
		.attr("x", function(d) { return d.x-5; })
		.attr("y", function(d) { return d.y; })
		.text(playerName)
		.attr("font-family", "sans-serif")
		.attr("font-size", "10px")
		.attr("fill", function (d,i) { return playerColors[i]; })
		;
		
		
	function playerData(off_locs, def_locs) {
		var data = new Array();
		var width = 500;
		var height = 470;
		for (let i = 0; i < off_locs.length; i++) {
			data.push({
				x: (off_locs[i].x+25)*10,
				y: (off_locs[i].y)*10				
			})
		}
		for (let j = 0; j < def_locs.length; j++) {
			data.push({
				x: (def_locs[j].x+25)*10,
				y: (def_locs[j].y)*10				
			})
		}
		return data;
	} */
	
	function gridData() {
		var data = new Array();
		var y, x;
		let i = 0;
		for (let row = 0; row < 47; row++) {
			for (let col = 0; col < 50; col++) {
				data.push({
					x: col * 10,
					y: row * 10
				})
				i++;
			}
		}
		return data;
	}
}