var REGIONS = null;
var CELLS = [];

var REGION_TERRAINS =  [{"name":"Easy", "multiplier":1},
				{"name":"Moderate","multiplier":1.5},
				{"name":"Hard","multiplier":2},
				{"name":"Severe","multiplier":3},
				{"name":"Daunting","multiplier":5},
				{"name":"Impassable","multiplier":-1}];


var REGION_TYPES = [{"name":"Free Lands","tn":12},
			{"name":"Border Lands","tn":14},
			{"name":"Wild Lands","blight_freq":7, "tn":16},
			{"name":"Shadow Lands","blight_freq":1, "tn":18},
			{"name":"Dark Lands","blight_freq":0.5, "tn":20}];


function loadRegions() {
	$.get( '/regions.json', function( json ) {
		REGIONS = JSON.parse(json);

		for(var i=0;i<REGIONS.length;i++) {
			var region = REGIONS[i];
			for(var j=0;j<REGION_TERRAINS.length;j++) {
				t = REGION_TERRAINS[j];
				if( t.name == region.terrain ) {
					region.terrain = t;
				}
			}
			for(var j=0;j<REGION_TYPES.length;j++) {
				t = REGION_TYPES[j];
				if( t.name == region.type ) {
					region.type = t;
				}
			}		
			for(var j=0;j<region.cells.length;j++){
				var cell = region.cells[j];
				if (CELLS[cell.q] == undefined) {
					CELLS[cell.q] = [];
				}
				
				if (CELLS[cell.q][cell.r] == undefined ) {
					CELLS[cell.q][cell.r] = [];
				}
				CELLS[cell.q][cell.r].push( region );
//				cellAtCoords(cell.q,cell.r).classed("valid",true);
			}
		}

//		d3.selectAll("circle.valid")
//			.style("cursor","pointer");

		// now assign ghostbusters cursor to untagged cells


//		me_regions = data.regions;
//		me_region_table = data.cells;

/*		
		var image = map_images[MAP];
		if( typeof image != 'undefined' ) {
			var map = $("#pdf-canvas")[0];
			map.style.background = "url('" + image.src + "')";
			map.style.width = image.width + "px";
			map.style.height = image.height + "px";
		}	
		drawGrid();	
*/	
		
//		console.log( json );
//		console.log( me_regions );
//		console.log( me_region_table );
//		updateIndex();
//		drawGrid();
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
	if( CELLS[q] == undefined || 
		CELLS[q][r] == undefined ) {
		return undefined;
	} else {
		return CELLS[q][r];
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