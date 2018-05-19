function generateHeatMap(players) {

	var off_locs = [], def_locs = [], off_players = [], def_players = [], expected_value_map = [], playerInitials = [], playerColors = [], locations = [];	
	let j = 0;
	let k = 0;
	for (let i = 0; i < players.length; i++) {
		let str = players[i].player;
		let matches = str.match(/\b(\w)/g);
		playerInitials[i] = matches.join('');
		if (players[i].type === "Offense") {
			off_players[j] = readData(players[i].player,true);
			off_locs[j] = courtLoc(players[i].x-25,players[i].y);
			playerColors[i] = "white";
			j+=1;
		} else {
			def_players[k] = readData(players[i].player,false);
			def_locs[k] = courtLoc(players[i].x-25,players[i].y);
			playerColors[i] = "brown";
			k+=1;
		}
		locations[i] = courtLoc(players[i].x-25,players[i].y);
	}
		
	/* Testing block for generating fake players/locations */
	
	/* var players = JSON.parse(jsonData);
	for (let i = 0; i < players.length; i++) {
		let matches = players.player.match(/\b(\w)/g); 
		playerNames[i] = matches.join('');
	}
	*/
	
	/*str = "Lebron James";
	matches = str.match(/\b(\w)/g);
	playerNames = matches.join('');
	playerNames = ["AH", "JT", "JB", "GH", "KI", "KL", "DD", "JV", "OA", "SI"];
		
	var off_locs = [], def_locs = [], off_players = [], def_players = [], expected_value_map = [];
	for (let i = 0; i < 5; i++) {
		off_locs[i] = courtLoc();
		def_locs[i] = courtLoc();
		off_players[i] = offPlayer();
		def_players[i] = defPlayer();
	}*/
	for (let i = 0; i < off_locs.length; i++) {
		let expected_points = [];
		let projected_locs = generateShotLocations(off_locs[i]);
		let x_loc = [], y_loc = [];
		for (let j = 0; j < projected_locs.length; j++) {
			let distBin, fga_dist, fg_dist, closest_def, defBin, fga_def, fg_def, diff, coveredP, pts;
			/* Determine which bin to look in for FGA and FG% by shot distance */
			x_loc[j] = projected_locs[j].x;
			y_loc[j] = projected_locs[j].y;
			
			distBin = findDistBin(projected_locs[j]);
			fga_dist = off_players[i].distFGA[distBin];
			fg_dist = off_players[i].distFG[distBin];
			/* Determine which bin to look in for FGA and FG% by defender distance */
			closest_def = findClosestDef(projected_locs[j], def_locs);
			defBin = findDefBin(projected_locs[j], def_locs[closest_def]);
			if (isThreePointer(projected_locs[j])) {
				pts = 3.0;
				fga_def = off_players[i].def3FGA[defBin];
				fg_def = off_players[i].def3FG[defBin];
				diff = def_players[closest_def].diff3P;
				coveredP = off_players[i].def3FG[3];
			} else {
				pts = 2.0;
				fga_def = off_players[i].def2FGA[defBin];
				fg_def = off_players[i].def2FG[defBin];
				diff = def_players[closest_def].diff2P;
				coveredP = off_players[i].def2FG[3];
			}
			/* Compute cue weights and defender adjustment weighting */
			let rel_dist = computeRel(fg_dist, fga_dist);
			let rel_def = computeRel(fg_def, fga_def);
			let w_dist = computeWeightP(rel_dist, rel_def);
			let w_def = computeWeightP(rel_def, rel_dist);
			let w_diff = computeWeightDiff(coveredP, fg_def);
			/* Compute expected point value of one players shot at a given location */
			if (computeDist(projected_locs[j], courtLoc(0.0,4.0)) > 30) {
				expected_points[j] = 0;
			} else {
				//expected_points[j] = pts * (w_dist * (fg_dist + diff * w_diff) + w_def * fg_def);
				expected_points[j] = pts * (w_dist * (fg_dist/100 + diff/100 * w_diff) + w_def * fg_def/100);
			}
		}
		expected_value_map[i] = expectedValue(expected_points, x_loc, y_loc);
	}
	/* 
	System.out.println(expected_value_map);
	*/
		
	var heat_map = new Array ();
	for (let j = 0; j < 47; j++) {
		for (let i = 0; i < 50; i++) {
			heat_map.push(0);
		}
	}
	
	var sum = 0;
	var maximum = 0;
	for (let i = 0; i < expected_value_map.length; i++) {
		let foo = 0;
		for (let j = 0; j < expected_value_map[i].val.length; j++) {
			var ind = (expected_value_map[i].x[j] + 25) + expected_value_map[i].y[j] * 50;
			if (expected_value_map[i].x[j]>24 || expected_value_map[i].y[j]<0 || expected_value_map[i].x[j]<-25 || expected_value_map[i].y[j]>46) {
				heat_map[ind] = Math.max(heat_map[ind],0);
			} else if (expected_value_map[i].val[j] > 0) {
				heat_map[ind] = Math.max(heat_map[ind],expected_value_map[i].val[j]);
				sum = sum + expected_value_map[i].val[j];
				foo = foo + expected_value_map[i].val[j];
				if (expected_value_map[i].val[j] > maximum) {
					maximum = expected_value_map[i].val[j];
				}
			}
		}
	}
	
	grid(heat_map, locations, playerInitials, playerColors);
	alert("Average Expected Point Value = " + Math.round(sum/(5*5*5)*100)/100);	
}


function generateShotLocations(locations) {
	/* Returns CourtLocs within 2 ft radius at 8 radial locations - total of 17 court locations including center */
	var y = [], x  = [];
		y = [0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 2.0, 2.0, 2.0, 2.0, 2.0, -2.0, -2.0, -2.0, -2.0, -2.0];
		x = [-2.0, -1.0, 1.0, 2.0, -2.0, -1.0, 0.0, 1.0, 2.0, -2.0, -1.0, 0.0, 1.0, 2.0, -2.0, -1.0, 0.0, 1.0, 2.0, -2.0, -1.0, 0.0, 1.0, 2.0];
		//y = [0.0, 0.0, 1.0, 1.0, 1.0 -1.0, -1.0, -1.0, 0.0, 0.0, 2.0, 2.0, 2.0, -2.0, -2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 1.0, 1.0, -1.0, -1.0];
		//x = [1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, -1.0, 2.0, -2.0, 0.0, -2.0, 2.0, 0.0, -2.0, 2.0, 1.0, -1.0, 1.0, -1.0, 2.0, -2.0, 2.0, -2.0]; 

	var projected_locs = [];
	projected_locs[0] = locations;
	for (let i = 0; i < y.length; i++) {
		projected_locs[i+1] = courtLoc(locations.x+x[i], locations.y+y[i]);
	}
	return projected_locs;
}

function findDistBin(locs) {
	var dist;
	var basket;
	basket = courtLoc(0.0,4.0);
	dist = computeDist(locs, basket);
	if (dist >= 25) {
		return 5;
	} else if (dist >= 20) {
		return 4;
	} else if (dist >= 15) {
		return 3;
	} else if (dist >= 10) {
		return 2;
	} else if (dist >= 5) {
		return 1;
	}
	return 0;
}

function findDefBin(off_loc, def_loc) {
	var dist;
	dist = computeDist(off_loc, def_loc);
	if (dist >= 6) {
		return 3;
	} else if (dist >= 4) {
		return 2;
	} else if (dist >= 2) {
		return 1;
	}
	return 0;
}

function findClosestDef(off_loc, def_locs) {
	var minDist = 68.0;
	var ind = 0;
	var newDist;
	for (let i = 0; i < def_locs.length; i++) {
		newDist = computeDist(off_loc, def_locs[i]);
		if (newDist < minDist) {
			ind = i;
			minDist = newDist;
		}
	}
	return ind;
}

function computeWeightP(rel1, rel2) {
	/* Compute weight via cue combination, used for defender distance FG% and shot distance FG% */
	return rel1 / (rel1 + rel2);
}

function computeRel(p, fga) {
	/* Compute reliabilities, used for defender distance FG% and shot distance FG% */
	var variance = fga * (p/100) * (1 - (p/100));
	return 1.0 / variance;
}

function computeWeightDiff(coveredP, xP) {
	/* Compute weight for defender adjustment based on distance */
	//if (coveredP < xP) {
	//	return 1;
	//}
	return  coveredP / xP;
}

/*Start on expectedValue, then back to NBA.java */
function expectedValue(points, x_loc, y_loc) {
	var ev = {
		val: points,
		x: x_loc,
		y: y_loc
	};
	return ev;
}

function courtLoc(x_in, y_in) {
	/*Make this callable with x,y locations, obtained from user clicks*/
	var location = {
		x: Math.round(x_in),
		y: Math.round(y_in)
	};
	return location;
}

function computeDist(loc1,loc2) {
	/* Compute distance between two court locations */
	var dx = loc1.x - loc2.x;
	var dy = loc1.y - loc2.y;
	return Math.sqrt(dx * dx + dy * dy);
}

 function defWithin6ft(loc1,loc2) {
	/* Determine if a defender is within 6 ft of the offensive player */
	var dist = computeDist(loc1, loc2);
	if (dist >= 6) {
		return false;
	}
	return true;
}

function isThreePointer(loc) {
	/* Determine if player's shot is a 3 PT shot  */
	if (Math.abs(loc.x) >= 22 && loc.y <= 18) {
		return true;
	}
	var distance = Math.sqrt(loc.x * loc.x + loc.y * loc.y);
	if (distance > 26.75) {
		return true;
	}
	return false;
}

function grid(color, locations, playerName, playerColors) {
	var gData = gridData(color);
	var pData = playerData(locations);
	
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
		radius = 15;
		
	var svg = d3.select('#chart2')
		.append("svg")
		.attr("width",width + margin.left + margin.right)
		.attr("height",height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		;
	
	var colorScale = d3.scale.linear()
		.domain([0,Math.max.apply(Math,color)/2,Math.max.apply(Math,color)])
		.range(["#0000FF","#00FF00","#FF0000"])
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
		.style("fill", function (d) {
			return colorScale(d.color);
		})
		.style("opacity", ".4")
		.on("mouseover", mover)
		.on("mouseout", mout)
		;
	
		
	//svg.append("svg:image")
	//	.attr("xlink:href", "file:///C:/JavaCode/DIVA/nbahalfcourt.png")
	//	.attr("width", width)
	//	.attr("height", height - 15);
	
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
		.text(function (d,i) { return playerName[i]; })
		.attr("font-family", "sans-serif")
		.attr("font-size", "10px")
		.attr("fill", function (d,i) { return playerColors[i]; })
		;
		
		
	function playerData(locations) {
		var data = new Array();
		var width = 500;
		var height = 470;
		for (let i = 0; i < locations.length; i++) {
			data.push({
				x: (locations[i].x+25)*10,
				y: (locations[i].y)*10				
			})
		}
		return data;
	}
	
	function gridData(color) {
		var data = new Array();
		var y, x;
		let i = 0;
		for (let row = 0; row < 47; row++) {
			for (let col = 0; col < 50; col++) {
				data.push({
					x: col * 10,
					y: row * 10,
					color: color[i]
				})
				i++;
			}
		}
		return data;
	}
}

function readData(playerName,offense) {
var output;
	$.ajax({
		'async': false,
		'type': 'POST',
		'global': false,
		'url': 'allPlayersNBA.csv',
		'dataType': 'text',
		'data': {'request': "", 'target': 'arrange_url', 'method': 'method_target' },
		'success': function (data) {
			output = successFunction(data);
		}
	});
	
	return output;
	/*function testAjax() {
		return $.ajax({
			url: 'allPlayersNBA.csv',
			dataType: 'text'
		});
	}
	
	var promise = testAjax();
	promise.success(function (data) {
		var player = successFunction(data);
	});
	
	alert(promise.player);*/
	
			
	function successFunction(data) {
		var allRows = data.split(/\r?\n|\r/);
		for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
			var rowCells = allRows[singleRow].split(',');
			for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
				if (rowCells[rowCell] === playerName) {
					if (offense) {
						var player = {
							gp: parseInt(rowCells[rowCell + 2]),
							distFG: [parseInt(rowCells[rowCell + 4]), parseInt(rowCells[rowCell + 6]), parseInt(rowCells[rowCell + 8]), parseInt(rowCells[rowCell + 10]), 
							parseInt(rowCells[rowCell + 12]), parseInt(rowCells[rowCell + 14])],
							distFGA: [parseInt(rowCells[rowCell + 3]) * parseInt(rowCells[rowCell + 2]), parseInt(rowCells[rowCell + 5]) * parseInt(rowCells[rowCell + 2]), 
							parseInt(rowCells[rowCell + 7]) * parseInt(rowCells[rowCell + 2]), parseInt(rowCells[rowCell + 9]) * parseInt(rowCells[rowCell + 2]), 
							parseInt(rowCells[rowCell + 11]) * parseInt(rowCells[rowCell + 2]), parseInt(rowCells[rowCell + 13]) * parseInt(rowCells[rowCell + 2])],
							def2FG: [parseInt(rowCells[rowCell + 16]), parseInt(rowCells[rowCell + 18]), parseInt(rowCells[rowCell + 20]), parseInt(rowCells[rowCell + 22])],
							def2FGA: [parseInt(rowCells[rowCell + 15]), parseInt(rowCells[rowCell + 17]), parseInt(rowCells[rowCell + 19]), parseInt(rowCells[rowCell + 21])],
							def3FG: [parseInt(rowCells[rowCell + 24]), parseInt(rowCells[rowCell + 26]), parseInt(rowCells[rowCell + 28]), parseInt(rowCells[rowCell + 30])],
							def3FGA: [parseInt(rowCells[rowCell + 23]), parseInt(rowCells[rowCell + 25]), parseInt(rowCells[rowCell + 27]), parseInt(rowCells[rowCell + 29])],
							playerName: playerName
						}
						return player;
					} else {
						var player = {
							diff2P: parseInt(rowCells[rowCell + 31]),
							diff3P: parseInt(rowCells[rowCell + 32]),
							playerName: playerName
						}
						return player;
					}
					/*var player {
						fga2: rowCells[rowCell + 3]
						
					}*/

				}
			 /* if (singleRow === 0) {
				table += '<th>';
				table += rowCells[rowCell];
				table += '</th>';
			  } else {
				table += '<td>';
				table += rowCells[rowCell];
				table += '</td>';
			  }
			}
			if (singleRow === 0) {
			  table += '</tr>';
			  table += '</thead>';
			  table += '<tbody>';
			} else {
			  table += '</tr>'; */
			}
		} 
		table += '</tbody>';
		table += '</table>';
	}
}