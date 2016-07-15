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

