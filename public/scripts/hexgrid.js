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

function gridLocToCenter( loc ) {
	var xpos = HEX_SCALE.x * 3 / 2 * loc.q  + MAP_BORDER.x + MAP_OFFSET.x;
	var ypos = HEX_SCALE.y * Math.sqrt(3) * (loc.r + (loc.q % 2 / MAP_STAGGER)) + MAP_BORDER.y + MAP_OFFSET.y;
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
	var adjx = point.x - (MAP_BORDER.x + MAP_OFFSET.x);
	var adjy = point.y - (MAP_BORDER.y + MAP_OFFSET.y);
	return { 'q': Math.round((2.0 * adjx / 3) / HEX_SCALE.x), 'r': Math.round((1.0/3 * Math.sqrt(3) * adjy - 1.0 / 3 * adjx) / HEX_SCALE.y )}
}

function fillColor( cell ) {
	return (cell.getAttribute("state") ? "yellow" : "transparent")
}

function drawHexes( data ) {	
	var map_offset = MAP_META_DATA[CURRENT_MAP].map_offset;

	d3.select( "#overlay" )
		.selectAll( "polygon" )
		.data( data )
		.enter().append("polygon")
			.attr("points", function(d) {return gridLocToVertices(d);})
			.attr("q", function(d) {return d.q + map_offset.q;})
			.attr("r", function(d) {return d.r + map_offset.r;})
	//		.attr("region_id", function(d) {return regionIdForCell(d);})
			.attr("stroke", "transparent" )
			.attr("stroke-width", 1 )
			.attr("fill", "transparent" )
			.attr("opacity", 0.5 )
			.attr("selected", false )
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
			var selected = d3.select(this).attr("selected") == "true";
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

function revertCellByCoords( q, r ) {
	revertCells( d3.select(selectorForCoords(q,r)));
}

function revertAllCells() {
	revertCells( d3.selectAll(".hex_cell") );
}

function fillCells( selection ) {  // selection should be a single cell
	r0 = selection.attr("r");
	q0 = selection.attr("q");
	for(var r = r0-1;r<r0+2;r++) {
		for(var q = q0-1;q<q0+2;q++) {
			if( r != r0 || q != q0 ) {
				var neighbor = d3.select()
				fillCells( {"q":q, "r":r } )
			}
		}
	}
}

function getSelectedCells() {
	return d3.selectAll( ".hex_cell[selected='true'");
}

