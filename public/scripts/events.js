var DRAWING_MODE = true;
var MOUSE_DOWN = false;

function mouseEnter( d ) {
//	document.getElementById( "coordinates").innerHTML = "("+d.q+","+d.r+")"
	/*if( mouse_down ) {
		selectCell( d, i, d3.select(this) );
	}*/

	cell = d3.select(this);
	displayCellLocation( cell );
//	console.log( `${d.r}, ${d.q}`)

	if( MOUSE_DOWN ) {
		changeSelectionState( cell, DRAWING_MODE );
	}
/*	cell
		.attr( "stroke", "yellow" )
		.attr( "stroke-width", 2 )
		.attr( "opacity", function() { return (d3.select(this).attr( "selected" ) == "true" ? 0.5 : 0.25 );} )
		.attr( "fill", function() { return (d3.select(this).attr( "selected" ) == "true" ? "yellow" : "white" );} );
*/



/*	var region_id = d3.select(this).attr("region_id");
	if( region_id > -1 ) {
		var region = regionForId(region_id);
		if( !region ) {
			console.log( "No region for ID: " + region_id );
		}
		document.getElementById( "current_region_icon" ).src = ( region.region_type == "unrated" ? "" : "/images/" + region.icon);			
		document.getElementById( "current_region_name" ).innerHTML = region.name;
		document.getElementById( "current_region_type" ).innerHTML = region.region_type;
		document.getElementById( "current_region_terrain" ).innerHTML = region.terrain_type;
	}
	else {
		document.getElementById( "current_region_icon" ).src = "";		
		document.getElementById( "current_region_name" ).innerHTML = "";
		document.getElementById( "current_region_type" ).innerHTML = "";
		document.getElementById( "current_region_terrain" ).innerHTML = "";		
	}
	*/
}


function mouseOut( d, i ) {
	var cell = d3.select(this);
//	var checkbox = document.getElementById( "toggle_grid" );
/*
	var cell = d3.select(this)
	.attr( "opacity", function() { return (d3.select(this).attr( "selected" ) == "true" ? 0.5 : 0.25 );} )
	.attr( "stroke-width", 1 )
	.attr( "stroke", "transparent" ) // function() { return (checkbox.checked ? "red" : "transparent" );}) 
	.attr( "fill", function() { return (d3.select(this).attr( "selected" ) == "true" ? "yellow" : "transparent" );});
//		.attr( "fill", function() {
//			return (this.getAttribute("selected") == "true" ? "yellow" : "transparent" );});
*/
}

function mouseDown( d ) {
	MOUSE_DOWN = true;
	cell = d3.select(this);
//	console.log(cell.attr("selected"));
	DRAWING_MODE = !(cell.attr("selected") == "true");
	if( SHIFTED ) {
		fillCells( d );
	} else {
		changeSelectionState( cell, DRAWING_MODE );
	}
}

function mouseUp( d ) {
	MOUSE_DOWN = false;
}

function changeMap( radioButton ) {
	selection = getSelectedCells();
	console.log( SELECTED_CELLS );
	CURRENT_MAP = radioButton.getAttribute( "map_name") + ".jpg";
	displayCurrentMap();
	for(var i=0;i<SELECTED_CELLS.length;i++) {
		var cell=SELECTED_CELLS[i];
		changeSelectionState( cellAtCoords( cell.q, cell.r ), true );
	}
}
