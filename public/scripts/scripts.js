var SHIFTED = false;

$(document).ready( function() {
	loadMaps();
	loadRegions();
	loadLocations();
//	drawGrid();

	$( "#control_panel" ).mouseenter( function() {
		$( this ).fadeTo( 0.25, 1 );
	});
	$( "#control_panel" ).mouseleave( function() {
		$( this ).fadeTo( 0.25, 0.6 );
	});

})

$(document).on('keyup keydown', function(e){SHIFTED = e.shiftKey} );

function displayCellInfo( cell ) {
	var q = cell.attr('q');
	var r = cell.attr('r');
	d3.selectAll("g.inner_date").attr("opacity",0.0);
	d3.select("g.inner_date[q='"+q+"'][r='"+r+"']").attr("opacity",0.7);
	$("#cell_location").html( `${q}, ${r}` );
	region = regionsForCell( q, r );// CELLS[q][r];
	if( region ) {
		$("#region_count").html( region.length );

		region = region[0];
		$("#region_id").html( region.id );
		$("#region_name").html( region.name );
		$("#region_type").html( region.type.name );
		$("#region_terrain").html( region.terrain.name );
	} else {
		$("#region_id").html( "" );
		$("#region_name").html( "" );
		$("#region_type").html( "" );
		$("#region_terrain").html( "" );		
	}		
}

function fillModeOn() {
	return $("#tagging_mode").prop('checked')
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

var clearSel = function() {
	changeSelectionState( d3.selectAll("polygon.hex_cell"), false );
	d3.selectAll("g.date").remove();
}

var gltv = gridLocToVertices;

var selectionAsString = function() {
	var result = "";
	getSelectedCells().each( function(d) {
		var cell = d3.select(this);
		result += ";" + cell.attr("q") + "," + cell.attr("r");
	})
	return result.substring(1,result.length);
}

