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
		$( this ).fadeTo( 0.25, 0.5 );
	});

	console.log("fading?");
})

$(document).on('keyup keydown', function(e){SHIFTED = e.shiftKey} );

function displayCellLocation( cell ) {
	$("#cell_location").html( `${cell.attr('q')}, ${cell.attr('r')}` );
}

/* CONSOLE COMMANDS */

var highlightRegionName = function( stringName ) {
	region = findRegionByName(stringName);
	highlightRegion( region );
}

var clearSel = function( stringName ) {
	changeSelectionState( d3.selectAll("polygon"), false );
}

var selectionAsString = function() {
	var result = "";
	getSelectedCells().each( function(d) {
		result += ";" + d.q + "," + d.r;
	})
	return result.substring(1,result.length);
}

