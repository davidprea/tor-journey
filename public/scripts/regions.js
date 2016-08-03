var REGIONS = null;
var REGION_GRID = [];

var REGION_TERRAINS =  {"Easy":{"name":"Easy", "multiplier":1},
				"Moderate":{"name":"Moderate","multiplier":1.5},
				"Hard":{"name":"Hard","multiplier":2},
				"Severe":{"name":"Severe","multiplier":3},
				"Daunting":{"name":"Daunting","multiplier":5},
				"Impassable":{"name":"Impassable","multiplier":-1}};


var REGION_TYPES = {
			"Free Lands":{"name":"Free Lands","tn":12},
			"Border Lands":{"name":"Border Lands","blight_dice":1, "tn":14},
			"Wild Lands":{"name":"Wild Lands","blight_freq":7, "blight_dice":2, "tn":16},
			"Shadow Lands":{"name":"Shadow Lands","blight_freq":1, "blight_dice":3, "tn":18},
			"Dark Lands":{"name":"Dark Lands","blight_freq":0.5, "blight_dice":4, "tn":20}};


function loadRegions() {
	$.get( '/regions.json', function( json ) {
		region_list = JSON.parse(json);
		REGIONS = [];

		for(var i=0;i<region_list.length;i++) {
			var rdata = region_list[i];
			var name = rdata.name;
			var terrain = REGION_TERRAINS[rdata.terrain];
			var type = REGION_TYPES[rdata.type];
			var region = new Region(name,i,type,terrain,rdata.cells);
			REGIONS.push(region);
		}

	})
}

function regionsForCell( q, r ) {
	/*result = [];
	for(var i=0;i<REGIONS.length;i++) {
		region = REGIONS[i];
		for(var j=0;j<region.cells.length;j++) {
			var cell = regions.cells[j];
			if( cell.r == location.r && cell.q == location.q ) {
				result.push(cell);
			}
		}
	}
	return result;*/
	if( REGION_GRID[q] == undefined || 
		REGION_GRID[q][r] == undefined ) {
		return undefined;
	} else {
		return REGION_GRID[q][r];
	}
}

function findRegionByName( stringName ) {
	for(var i=0;i<REGIONS.length;i++) {
		region = REGIONS[i];
		if( region.name == stringName) {
			return region;
		}
	}
	return null;
}

function findRegionByID( id ) {
		for(var i=0;i<REGIONS.length;i++) {
		region = REGIONS[i];
		if( region.id == id) {
			return region;
		}
	}
	return null;
}



function highlightRegion( region ) {
	revertAllCells(); // need to write this
	for(var i=0;i<region.cells.length;i++) {
		cell = region.cells[i];
		changeSelectionState( cellAtCoords( cell.q, cell.r), true );
	}
}