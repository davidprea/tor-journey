var JOURNEY = new Journey();

// "selection" == d3 selection.  "selected" == selected attribute
function changeSelectionState( selection, selected ) {
	var changed = false;
	selection.each( function(d) {
		var index = -1;
		if( isValidCell( d ) || fillModeOn() ) {
			var cell = d3.select(this);
			var q = parseInt(cell.attr('q'));
			var r = parseInt(cell.attr('r'));
			if( cell.classed("selected") != selected ) {
				cell.classed("selected",selected);
				changed = true;
				for(var i=0;i<CELLS.length;i++) {
					var s_cell = CELLS[i];
					if( s_cell.q == q && s_cell.r == r ) {
						index = i;
					}
				}
				if( !selected && index >= 0 ) {
					CELLS[index].removeAllNeighbors();
					CELLS.splice(index,1);
				} else if ( selected && index == -1 ) {
					var new_cell = new Cell(q,r,CELLS.length);
					CELLS.push( new_cell );
					new_cell.findNeighborsIn( CELLS );
				}
			}

		}
	})

	if( changed == true ) {
		d3.select("svg").selectAll("text").remove();
		d3.select("svg").selectAll("path").remove();

//		updateAppearance(selection);

		if( !($("#tagging_mode").prop('checked'))) {
			computeJourney();

		}

	}
}




function isValidCell( cell ) {
	var q = cell.q + currentMap().origin.q;
	var r = cell.r + currentMap().origin.r;
	return (REGION_GRID[q] && REGION_GRID[q][r] )
}


/* Imported Code from Previous Version */

function reverseJourney() {
	computeJourney();
}

function sortCells() {
	var allPaths = getAllPaths();

	if( allPaths.length != 1 ) {
		return false;;
	} else {
		CELLS = allPaths[0];
		return true;
	}
}

function markFirst() {
	d3.selectAll("polygons")
		.classed("first",false);
	CELLS[0].d3()
		.classed("first",true)
}




function computeJourney() {
	clearSummary();


	$( "#tabs" ).tabs( "option", "active", 1 );

	if( !sortCells() ) {
		addNotation( CELLS, "idString", {"class":"number", "x":0, "y":4, "color":"#AA0000"});
		return;
	}

	// is this the right place for this?
	markFirst();
	drawJourney();

	/* RESOLVE REGIONS */
	buildChain();
//	CELLS[0].resolveRegions();


	/* PREPARE LEGS */
	/* This can be done concurrently with calculating dates and rolls */
	// somehow we need to be able to select riding/road/boat for various legs
	// http://swisnl.github.io/jQuery-contextMenu/index.html
	// include range of cells affected inside each leg; selecting from menu applies modifier to all those cells
	var journey = new Journey();


	/* SET VARIABLES FOR JOURNEY */
	var elapsed_miles = 0;
	var elapsed_days = 0;
	var blight_meter = 0.0;
	var fatigue_meter = 0.01; // start off with a tiny bit to resolve rounding of 1/7
	// var speed = ( document.getElementById("riding").checked ? 40 : 20 );

	/* DATES */
	var start_month = parseInt( document.getElementById( "startmonth" ).value );
	var start_day = parseInt( document.getElementById( "startday" ).value );
	var start_date = new Date( 0, start_month, start_day );
	var current_date = start_date;

	/* arrays for cells that need graphics */
	var date_cells = []; 
	var blight_cells = [];
	var fatigue_cells = [];
//	var currentDate = new Date( start_date );

//	var currentDate = new Date( start_date );

	/* SET LEG ATTRIBUTES */
	/* First time through just set values */

	var last_day_stamped = -1;


	var leg;
	journey.start = CELLS[0];

	for(var i=1;i<CELLS.length;i++) { // start with 1
		var cell = CELLS[i];
		
	
		/* handle legs */
		if( !leg || leg.region != cell.region() ) {
			if( leg ) {
				journey.addLeg(leg);
			}
			leg = new Leg(cell.region());
		}
		leg.addCell(cell);
		/* apply attributes from cells to leg, then apply from leg to cells */

		cell.arrival_date = current_date; // this should start off null
//		elapsed_days += cell.travelTime();
		current_date = cell.departureDate();

		/* BLIGHT */
		if( cell.blightCheckFreq() > 0 ) {
			blight_meter += cell.travelTime() / cell.blightCheckFreq();
			cell.blight_checks = Math.floor( blight_meter );
			blight_meter -= cell.blight_checks;
		}

		/* FATIGUE */
		fatigue_meter += cell.travelTime() / cell.fatigueTestFreq();
		cell.fatigue_tests = Math.floor( fatigue_meter );
		fatigue_meter -= cell.fatigue_tests;	
	}

	if( leg ) {
		journey.addLeg(leg);		
	}


	journey.total_rolls = Math.ceil( journey.total_rolls );

	if( journey.length > 1 ) {
		journey[0]["next"] = journey[1].region.name;
	}

	var leftover = 0;
	for(var i=0;i<journey.length;i++) {
		var leg = journey[i];
		var rolls = leg.days * 1.0 * journey.total_rolls / journey.total_days + leftover;
		leg.travel_rolls = Math.round( rolls );
		leftover = rolls - leg.travel_rolls;
	}


	// last, create the date stamps
	displayDates( journey.allCells() );
	addNotation( journey.fatigueCells(), "fatigueString", {"class":"fatigue", "x":0, "y":-6, "color":"#000088"});
	addNotation( journey.blightCells(), "blightString", {"class":"blight", "x":0, "y":15, "color":"#006600"});
//	createJourneySummary(journey);
}

function buildChain() {
	var prev_cell;
	for(var i=0;i<CELLS.length;i++) {
		CELLS[i].setPrev( prev_cell );
		prev_cell = CELLS[i];
	}
}



function clearSummary() {
		$("#journey_summary div").remove();
}

/**** PATH TRAVERSAL ******/

function getAllPaths() {
	var pool = CELLS.slice();
	var paths = [];
//	var max_length = 0;
//	var max_index = 0;
	while( pool.length > 0 ) {
		var result = findLongestSegment( pool );
		paths.push( result.path );
		pool = result.leftover;
	}

	/* now try to splice pieces together */

	for(var i=0;i<paths.length-1;i++) {
		var frag1 = paths[i];
		for(var j=i;j<paths.length;j++) {
			var frag2 = paths[j];
			var join = spliceFragments( frag1, frag2 );
			if( join ) {
				paths[i] = join;
				paths.splice(j,1);
				j--;
			}
		}
	}

	return paths;
}

function spliceFragments( frag1, frag2 ) {
	var f1b = frag1[0];
	var f1e = frag1[frag1.length-1];
	var f2b = frag2[0];
	var f2e = frag2[frag2.length-1];

	if( f1e.adjacentTo(f2b) ) {
		return frag1.concat( frag2 );
	} else if ( f1e.adjacentTo(f2e)) {
		return frag1.concat( frag2.reverse() );
	} else if( f1b.adjacentTo(f2e)) {
		return frag2.concat( frag1 );
	} else if ( f1b.adjacentTo(f2b)) {
		return frag1.reverse().concat( frag2 );
	}
	return null;
}

function findLongestSegment( list, index = 0 ) {
	var pool = list.slice();
	var cell = pool.splice(index,1)[0];

	var result = {"leftover": pool, "path": [cell]};
	var neighbors = cell.neighborsIn( pool );

	var path_found = [];
	for(var i=0;i<neighbors.length;i++) {
		var n_index = pool.indexOf( neighbors[i] );
		if( n_index == -1 ) {
			debugger;
		}
		longest = findLongestSegment( pool, n_index );
		l1 = path_found.length;
		l2 = longest.path.length;
		if( l2 > l1 || (l1 == l2 && (path_found[0].index > longest.path.index ))) {
			path_found = longest.path;
			result.leftover = longest.leftover;
		}	
	}

	result.path = result.path.concat( path_found );

	return result;
}




