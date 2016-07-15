function mouseOver( d ) {
//	document.getElementById( "coordinates").innerHTML = "("+d.q+","+d.r+")"
	/*if( mouse_down ) {
		selectCell( d, i, d3.select(this) );
	}*/


//	console.log( `${d.r}, ${d.q}`)
	d3.select(this)
		.attr( "stroke", "yellow" )
		.attr( "stroke-width", 2 )
		.attr( "opacity", function() { return (d3.select(this).attr( "selected" ) == "true" ? 0.5 : 0.25 );} )
		.attr( "fill", function() { return (d3.select(this).attr( "selected" ) == "true" ? "yellow" : "white" );} );
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
//	var checkbox = document.getElementById( "toggle_grid" );
	var cell = d3.select(this)
	.attr( "opacity", function() { return (d3.select(this).attr( "selected" ) == "true" ? 0.5 : 0.25 );} )
	.attr( "stroke-width", 1 )
	.attr( "stroke", "transparent" ) // function() { return (checkbox.checked ? "red" : "transparent" );}) 
	.attr( "fill", function() { return (d3.select(this).attr( "selected" ) == "true" ? "yellow" : "transparent" );});
//		.attr( "fill", function() {
//			return (this.getAttribute("selected") == "true" ? "yellow" : "transparent" );});
}

function changeMap( radioButton ) {
	CURRENT_MAP = radioButton.getAttribute( "map_name") + ".jpg";
	displayCurrentMap();
}