var DRAWING_MODE = true;
var MOUSE_DOWN = false;

function mouseEnterDate() {
//	d3.select(this).attr("opacity",1.0);
	d3.select(this).attr("opacity",0.95);
//this.setAttribute( "style.opacity","1.0");
//	mouseEnter();
}

function mouseEnter() {
/*	var target = d3.select(this);
	if( target.classed("date") ) {
		target.attr("opacity",0.95);
	}
*/
	point = d3.mouse(this);
	cell = cellAtPoint(point);
	displayCellInfo( cell );

/*	if( MOUSE_DOWN ) {
		changeSelectionState( cell, DRAWING_MODE );
	}
*/


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

function mouseOutDate() {
//	console.log(this);
//	d3.select(this).attr("opacity",0);
//	mouseOut();
}

function mouseOut() {
	d3.selectAll("g.inner_date").attr("opacity",0.0);

/*	var target = d3.select(this);
	if( target.classed("date") ) {
		target.attr("opacity",0.0);
	}
*/
//	point = d3.mouse(this);
//	cell = cellAtPoint(point);

//	cell = cellForEvent(cell);
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


function mouseDown() {
//	MOUSE_DOWN = true;
	point = d3.mouse(this);
	cell = cellAtPoint(point);
	if( cell.size() == 0 ) { return }

	DRAWING_MODE = !(cell.classed("selected"));
	if( fillModeOn() && SHIFTED ) {
		fillCells( cell, DRAWING_MODE );			
	} else {
		changeSelectionState( cell, DRAWING_MODE );
	}
}

function mouseUp( d ) {
//	MOUSE_DOWN = false;
	//numberCells();
	
//	computeJourney();
}

function changeMap( radioButton ) {
	selection = getSelectedCells();
	CURRENT_MAP = radioButton.getAttribute( "map_name") + ".jpg";
	displayCurrentMap();
	for(var i=0;i<SELECTED_CELLS.length;i++) {
		var cell=SELECTED_CELLS[i];
		changeSelectionState( cellAtCoords( cell.q, cell.r ), true );
	}
}
