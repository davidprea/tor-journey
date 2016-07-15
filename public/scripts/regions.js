var REGIONS = null;

function loadRegions() {
	$.get( '/regions.json', function( json ) {
		REGIONS = JSON.parse(json);

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

function regionsForCell( location ) {
	result = [];
	for(var i=0;i<REGIONS.length;i++) {
		region = REGIONS[i];
		for(var j=0;j<region.cells.length;j++) {
			var cell = regions.cells[j];
			if( cell.r == location.r && cell.q == location.q ) {
				result.push(cell);
			}
		}
	}
	return result;
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

var highlightRegionName = function( stringName ) {
	region = findRegionByName(stringName);
	highlightRegion( region );
}

function highlightRegion( region ) {
	revertAllCells(); // need to write this
	for(var i=0;i<region.cells.length;i++) {
		cell = region.cells[i];
		var selector = selectorForCoords( cell.q, cell.r );
		selectCells( d3.select(selector) );
	}
}