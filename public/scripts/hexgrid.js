function drawGrid() {
	//startProgress();
	
	d3.select( "#overlay" )
		.selectAll( "*" )
		.remove();
		
	if( !hex_data ) {
		var hex_data = [];
	}
		
	var columns = ($("#map").width() - (2 * MAP_BORDER.x)) / HEX_SCALE.x * 0.66;
	var rows = ($("#map").height() - (2 * MAP_BORDER.y)) / HEX_SCALE.y * 0.555 + 1;
	
//	console.log( "columns: " + columns + " rows: " + rows );

	for(var q=1;q<columns;q++) {
		for( var r=1;r<rows;r++) {
			hex_data.push( {'q':q, 'r':r } );
		}
	}
	drawHexes( hex_data );
	//endProgress();
	//displayExtraLocations();
}

/*
function pointToVertices( point ) {
	var string = "";
	for(var v=0;v<6;v++) {
		var angle = 2 * Math.PI / 6 * v;
		var x = point.x + HEX_SCALE * Math.cos(angle);
		var y = point.y + HEX_SCALE * Math.sin(angle);
		string += x + "," + y + " ";
	}
	console.log( string );
	return string;
}
*/

function cellLocToCenter( cell ) {
	var loc = {"q": cell.q - MAP_OFFSET.q, "r": cell.r - MAP_OFFSET.r};
	var point = gridLocToCenter( cell );
	return point;
}

function gridLocToCenter( loc ) {
	var xpos = Math.floor( HEX_SCALE.x * 3 / 2 * loc.q  + MAP_BORDER.x + CELL_OFFSET.x );
	var stagger = (loc.q + MAP_STAGGER.parity) % 2 * MAP_STAGGER.step;
//	console.log(stagger);
	var ypos = Math.floor( HEX_SCALE.y * Math.sqrt(3) * (loc.r + stagger + (loc.q % 2 / 2.0)) + MAP_BORDER.y + CELL_OFFSET.y );
	return {'x':xpos, 'y':ypos };
}

function gridLocToVertices( location ) {
	var center = gridLocToCenter( location );
	
	if( hex_offsets.length == 0 ) {
		for(var v=0;v<6;v++) {
			var angle = 2 * Math.PI / 6 * v;
			var dx = HEX_SCALE.x * Math.cos(angle) * 0.9;
			var dy = HEX_SCALE.y * Math.sin(angle) * 0.9;
			hex_offsets[v] = {"dx":dx, "dy":dy}
		}		
	}
	
	var string = "";
	for(var v=0;v<6;v++) {
		var x1 = center.x + hex_offsets[v].dx;
		var y1 = center.y + hex_offsets[v].dy;
		string += x1.toFixed(1) + "," + y1.toFixed(1) + " ";
	}
	return string;
}

function pointToGrid( point ) {
	var adjx = point.x - (MAP_BORDER.x + CELL_OFFSET.x);
	var adjy = point.y - (MAP_BORDER.y + CELL_OFFSET.y);
	var q = Math.round((2.0 * adjx / 3) / HEX_SCALE.x);
	var stagger = (q + MAP_STAGGER.parity) % 2 * MAP_STAGGER.step
//	var r = (1.0/3 * Math.sqrt(3) * adjy - 1.0 / 3 * adjx) / HEX_SCALE.y;
	var r = (adjy / (HEX_SCALE.y * Math.sqrt(3))) - (q%2/2.0) - stagger;
	var grid = { 'q': q, 'r': Math.round(r)};
//	console.log(grid);
	return grid;
}

function pointToCoords( point ) {
	var grid = pointToGrid( {"x":point[0], "y":point[1]} );
	var q = grid.q + MAP_OFFSET.q;
	var r = grid.r + MAP_OFFSET.r;
	result = {"q":q, "r":r};
//	console.log(result);
	return result;
}

function fillColor( cell ) {
	return (cell.getAttribute("state") ? "yellow" : "transparent")
}

function drawHexes( data ) {	
	d3.select( "#overlay" )
		.selectAll( "polygon" )
		.data( data )
		.enter().append("polygon")
			.attr("points", function(d) {return gridLocToVertices(d);})
			.attr("q", function(d) {return d.q + MAP_OFFSET.q})
			.attr("r", function(d) {return d.r + MAP_OFFSET.r})
	//		.attr("region_id", function(d) {return regionIdForCell(d);})
			.attr("stroke", "transparent" )
			.attr("stroke-width", 1 )
			.attr("fill", "transparent" )
			.attr("opacity", 0.5 )
			.classed("selected", false )
			.classed("hex_cell", "true" )
			.on("mouseenter", mouseEnter )
			.on("mouseout", mouseOut )
			.on("mousedown", mouseDown )
			.on("mouseup", mouseUp );
}

var selectTest = function(arg) {
	selectCells(arg);
}

/*
function selectCells( selection ) {
	console.log(selection);
	selection
		.attr( "stroke", "yellow" )
		.attr( "stroke-width", 2 )
		.attr( "opacity", function() { return (d3.select(this).attr( "selected" ) == "true" ? 0.5 : 0.25 );} )
		.attr( "fill", function() { return (d3.select(this).attr( "selected" ) == "true" ? "yellow" : "white" );} );
}

function revertCells( selection ) {
	selection
		.attr( "opacity", function() { return (d3.select(this).attr( "selected" ) == "true" ? 0.5 : 0.25 );} )
		.attr( "stroke-width", 1 )
		.attr( "stroke", "transparent" ) // function() { return (checkbox.checked ? "red" : "transparent" );}) 
		.attr( "fill", function() { return (d3.select(this).attr( "selected" ) == "true" ? "yellow" : "transparent" );});

}*/

function updateAppearance( selection ) {
	selection
		.each( function() {
			var selected = d3.select(this).classed("selected");
			d3.select(this)
				.attr( "opacity", function() { return (selected ? 0.5 : 0.25 ); })
				.attr( "fill", function() { return (selected ? "yellow" : "transparent"); })
				.attr( "stroke", function() { return (selected ? "yellow" : "transparent"); })  // function() { return (checkbox.checked ? "red" : "transparent" );}) 
				.attr( "stroke-width", function() { return (selected ? 2 : 1); })
		})
}

function selectorForCoords( q, r ) {
	return ".hex_cell[q='" + q + "'][r='" + r + "']";
}

function cellAtCoords( q, r ) {
	return d3.select( selectorForCoords( q, r ));
}

function cellAtPoint( point ) {
	var coords = pointToCoords( point );
	return cellAtCoords( coords.q, coords.r );
}


/*function revertCellByCoords( q, r ) {
	revertCells( d3.select(selectorForCoords(q,r)));
}*/

function revertAllCells() {
	changeSelectionState( d3.selectAll(".hex_cell"), false );
}

function neighborsOf( cell ) { 
	result = [];
	var q = parseInt( cell.attr("q"));
	var r = parseInt( cell.attr("r"));
	var offset = ( q % 2 == 0 ? -1 : 0 );
	var deltas = [[-1,offset],[-1,1 + offset],[0,-1],[0,1],[1, offset],[1,1 + offset]];
	for(var i=0;i<deltas.length;i++) {
		var newq = q + deltas[i][0];
		var newr = r + deltas[i][1];
		neighbor = cellAtCoords( newq, newr );
		if( neighbor != null && neighbor.size() > 0) {
			result.push( neighbor );
		}	
	}
	return result;
}

function fillCells( cell, mode ) {  // selection should be a single cell
	changeSelectionState( cell, mode );
	var offset = ( cell.q % 2 == 0 ? -1 : 0 );
	var neighbors = neighborsOf( cell );
	for(var i=0;i<neighbors.length;i++) {
		var neighbor = neighbors[i];
		if( neighbor.classed("selected") != mode ) {
			fillCells( neighbors[i], mode );			
		}
	}
}

function getSelectedCells() {
	return d3.selectAll( ".hex_cell.selected");
}

function dateStringFromDate( date ) {
	var monthNames = [ "January", "February", "March", "April", "May", "June",
	    "July", "August", "September", "October", "November", "December" ];
	var month = monthNames[ date.getMonth() ].substring(0,3)
	return month + " " + date.getDate();
}

function displayDates( data ) {
	
	var cells = sortedCells();

	d3.select( "#overlay" )
		.selectAll("text")
		.remove();
	
	var s = d3.select( "#overlay" )
		.selectAll( "text" )
		.data(data);
				
	s.enter().append("text")
		.classed( "cell_date", "true" )
		.attr("x", function(d) {return cellLocToCenter(d).x; })
		.attr("y", function(d) {return cellLocToCenter(d).y + 3; })
		.attr("font-size", function() {return HEX_SCALE.y / 2;} )
		.text( function(d) {return dateStringFromDate(d.date);})
		.on("mouseenter", mouseEnter )
		.on("mouseout", mouseOut )
		.on("mousedown", mouseDown )
		.on("mouseup", mouseUp )
		.attr("text-anchor","middle");
//		.attr("stroke", "saddlebrown" )
//		.attr("font-size", 10);
		
	s.exit().remove();
}

/* TESTING FUNCTION */
function numberCells() {
	
	var cells = sortedCells();

	d3.select( "#overlay" )
		.selectAll("text")
		.remove();
	
	var s = d3.select( "#overlay" )
		.selectAll( "text" )
		.data(cells);
				
	s.enter().append("text")
		.classed( "cell_date", "true" )
		.attr("x", function(d) {return cellLocToCenter(d).x; })
		.attr("y", function(d) {return cellLocToCenter(d).y + 3; })
		.attr("font-size", function() {return HEX_SCALE.y / 2;} )
		.text( function(d,i) {return i;})
		.on("mouseenter", mouseEnter )
		.on("mouseout", mouseOut )
		.on("mousedown", mouseDown )
		.on("mouseup", mouseUp )
		.attr("text-anchor","middle");
//		.attr("stroke", "saddlebrown" )
//		.attr("font-size", 10);
		
	s.exit().remove();
}





