var REGIONS = null;
var CELLS = [];

function loadRegions() {
	$.get( '/regions.json', function( json ) {
		REGIONS = JSON.parse(json);

		for(var i=0;i<REGIONS.length;i++) {
			var region = REGIONS[i];
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