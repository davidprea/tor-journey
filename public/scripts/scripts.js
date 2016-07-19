var SHIFTED = false;

$(document).ready( function() {
	// load other javascript here
//	$.ajaxSetup({ cache: false });

	loadMaps();
	loadRegions();
//	drawGrid();

	$( "#control_panel" ).mouseenter( function() {
		$( this ).fadeTo( 0.25, 1 );
	});
	$( "#control_panel" ).mouseleave( function() {
		$( this ).fadeTo( 0.25, 0.6 );
	});

	console.log("fading?");
})

$(document).on('keyup keydown', function(e){SHIFTED = e.shiftKey} );

function displayCellInfo( cell ) {
	var q = cell.attr('q');
	var r = cell.attr('r');
	$("#cell_location").html( `${q}, ${r}` );
	region = regionsForCell( q, r );// CELLS[q][r];
	if( region != undefined ) {
		region = region[0];
		$("#region_id").html( region["id"] );
		$("#region_name").html( region["name"] );
		$("#region_type").html( region["type"] );
		$("#region_terrain").html( region["terrain"] );
	} else {
		$("#region_id").html( "" );
		$("#region_name").html( "" );
		$("#region_type").html( "" );
		$("#region_terrain").html( "" );		
	}		
}

/* CONSOLE COMMANDS */

var highlightRegionName = function( stringName ) {
	region = findRegionByName(stringName);
	highlightRegion( region );
}

var highlightRegionID = function( id ) {
	region = findRegionByID( id );
	highlightRegion( region );
}

var clearSel = function( stringName ) {
	changeSelectionState( d3.selectAll("polygon"), false );
}

var selectionAsString = function() {
	var result = "";
	getSelectedCells().each( function(d) {
		var cell = d3.select(this);
		result += ";" + cell.attr("q") + "," + cell.attr("r");
	})
	return result.substring(1,result.length);
}

