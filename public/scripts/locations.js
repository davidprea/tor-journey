var LOCATIONS = [];

function loadLocations() {
	$.get( '/locations.json', function( json ) {
		LOCATIONS = JSON.parse(json);
	})
}

function locationAtCell( cell ) {
	for(var i=0;i<LOCATIONS.length;i++) {
		var loc = LOCATIONS[i];
		if( loc.q == cell.q && loc.r == cell.r ) {
			return loc;
		}
	}
	return null;
}