// "selection" == d3 selection.  "selected" == selected attribute
function changeSelectionState( selection, selected ) {
	var changed = false;
	selection.each( function(d) {
		var index = -1;
		if( isValidCell( d ) || fillModeOn() ) {
			var cell = d3.select(this);
			if( cell.classed("selected") != selected ) {
				cell.classed("selected",selected);
				changed = true;
				for(var i=0;i<SELECTED_CELLS.length;i++) {
					s_cell = SELECTED_CELLS[i];
					if( s_cell.q == cell.attr('q') && s_cell.r == cell.attr('r') ) {
						index = i;
					}
				}
				if( !selected && index >= 0 ) {
					SELECTED_CELLS.splice(index,1);
				} else if ( selected && index == -1 ) {
					SELECTED_CELLS.push( {"q":parseInt(cell.attr('q')), "r":parseInt(cell.attr('r'))} );
				}					
			}
		
		} 
	})

	if( changed == true ) {
		d3.select("svg").selectAll("g.notation").remove();
		d3.select("svg").selectAll("path.journey").remove();
		d3.select("svg").selectAll("g.date").remove();

//		updateAppearance(selection);		

		if( !($("#tagging_mode").prop('checked'))) {
			computeJourney();

		}

	}
}

function isValidCell( cell ) {
	var q = cell.q + currentMap().origin.q;
	var r = cell.r + currentMap().origin.r;
	return (CELLS[q] && CELLS[q][r] ) 
}


/* Imported Code from Previous Version */

function invalidJourney( title ) {
	$("#journey div").remove();
	var div = document.createElement("div");
	div.className = "journey_warning";
	var title_label = document.createElement("label");
	title_label.className = "journey_title";
	title_label.appendChild( document.createTextNode( title ));
	div.appendChild( title_label );
	div.appendChild( document.createElement("p"));
	div.appendChild( document.createTextNode( "Make sure all selected cells are part of a single continuous chain, with a single path connecting them, and that you don't try to go through impassable mountains or beyond the edge of the named regions."));
	document.getElementById( "journey" ).appendChild( div );
}

function reverseJourney() {
	computeJourney();
}

function blightFreqForMonth( month ) {
	switch( month ) {
		case 11:
		case 0:
		case 1:
			return 3;
		case 2:
		case 3:
		case 4:
			return 5;
		case 5:
		case 6:
		case 7:
			return 6;
		case 8:
		case 9:
		case 10:
			return 4;
	}
	console.log( "can't have a month value of " + month );
	return 0;
}


function computeJourney() {	
	
	/*if( EDITING_MODE == true ) {
		return; 
	}*/
	
//	deleteDates();

	if( SELECTED_CELLS.length < 2 ) {
		return;
	} else {
		$( "#tabs" ).tabs( "option", "active", 1 );
	}
	
	var sorted_cells = sortedCellsNew();

	if( sorted_cells == -1 ) {
		return;
	}
	
	if( $("#first_cell_rule_1").prop("checked")) {
		sorted_cells.splice(0,1); // delete first cell
	}
	
	if( sorted_cells == "Discontiguous")  {
		invalidJourney( "Discontiguous Path");
		return
	} else if( sorted_cells == "Ambiguous")  {
		invalidJourney("Ambiguous Path");
		return
	} else if( sorted_cells == "Invalid") {
		invalidJourney("Off the Map");
		return;
	}

	// draw the journey path
	drawJourney( sorted_cells );
	//numberCells( sorted_cells );		


	/* RESOLVE REGIONS */
	resolveRegionsFor( sorted_cells );
	/*for(var i=0;i<sorted_cells.length;i++) {
		var cell = sorted_cells[i];
		if( cell.region.length == 1 ) {
			cell.region = cell.region[0];
		} else {
			prev_region = sorted_cells[i-1].region;
			if( prev_region != undefined ) {
				if( cell.region.indexOf( prev_region != -1 )) {
					cell.region = prev_region;
				}
			}
			next_regions = sorted_cells[i+1].regions;

		}
	}*/
	

	/* DIVIDE INTO LEGS */

	var journey = [];
	var leg = null;
	var last_loc = null;

	for(var i=0;i<sorted_cells.length;i++) {
		var cell = sorted_cells[i];
		var loc = locationAtCell( cell );

		if( cell.region.length < 1 ) { // need a different test
			invalidJourney("Outside the Lines");
			return;
		}
		// moved to sortedCells()
//		cell["distance"] = 10.0;  
//		if( $("#first_cell_rule_2").prop("checked")) {
			if( i == 0 || i == sorted_cells.length - 1) {
				cell.distance = 5.0;
			}
//		}
		
		if( !leg ) {
			leg = {"cells":[]};
			leg["region"] = cell.region;
		}

		if( leg.cells.length == 0 ) {
			if( loc ) {
				leg.start = loc;
			} else if ( last_loc ) {
				leg.start = last_loc;
				last_loc = null;
			}
		}


		if( leg.region != cell.region ) {
			if( !leg.end ) {
				leg.end = cell.region;
			}
			journey.push( leg );
			leg = null;
			i -= 1;
		} else {
			leg.cells.push( cell );
			if( loc && leg.cells.length > 1 ) {
				leg.end = loc;
				last_loc = loc;
				journey.push( leg );
				leg = null;
			}
		}
	}
	// and the final leg...
	if( leg ) {
		journey.push( leg );		
	}

	/* SET VARIABLES FOR LOOPING */

	
	journey["total_rolls"] = 0;
	journey["total_blight_checks"] = 0;
	journey["total_miles"] = 0;
	journey["total_days"] = 0;
	
	/* DATES */
	var start_month = parseInt( document.getElementById( "startmonth" ).value );
	var start_day = parseInt( document.getElementById( "startday" ).value );
	var start_date = new Date( 0, start_month, start_day );
//	date.setDate( date.getDate() - 1 ); // does this work?
//	var end_date = new Date(0, month, day );
	var date_cells = [];

	var blight_cells = [];
	var fatigue_cells = [];
//	var currentDate = new Date( start_date );
	var blight_meter = 0.0;
	var fatigue_meter = 0.01; // start off with a tiny bit to resolve rounding of 1/7
	var speed = ( document.getElementById("riding").checked ? 40 : 20 );
	
//	var currentDate = new Date( start_date );
	
	/* SET LEG ATTRIBUTES */
	/* First time through just set values */
	
	var last_day_stamped = -1;



	for(var i=0;i<journey.length;i++) {
		var leg = journey[i];
		leg["days"] = 0;
//		leg["region"] = regionForId(leg.region_id);
		
		if( leg.region.terrain.name == "Impassable" ) {
			invalidJourney( "Impassable!" );
			return;
		} else if ( !leg.region ) {
			invalidJourney( "Outside the Lines");
			return;
		}
		
		// position
		
		if( i == 0 ) {
			if( journey.length > 1 ) {
				leg["position"] = "first";				
			} else {
				leg["position"] = "only";
			}
		} else if ( i == journey.length - 1) {
			leg["position"] = "last";
		} else {
			leg["position"] = "middle";
		}
		
		leg["miles"] = 0;
		leg["fatigue_checks"] = 0;
		leg["blight_checks"] = 0;

		
		for(var c=0;c<leg.cells.length;c++) {
			var cell=leg.cells[c];
			leg.miles += cell.distance; // this might be only 5

			var starting_days = journey.total_days;

			var apparent_distance = cell.distance * leg.region.terrain.multiplier;
			var days_to_cross = apparent_distance / speed;
			journey.total_days += days_to_cross;
			var full_day_count = Math.floor( journey.total_days );
			//var additional_full_days = end_day - Math.floor( starting_days );
			leg.days += days_to_cross;

			var date = new Date( 0, start_month, start_day + full_day_count );
			cell["date"] = date;

			/* BLIGHT */

			if( cell.region.type.blight_freq) {
				blight_meter += days_to_cross * 1.0 / cell.region.type.blight_freq;
				cell["blight_checks"] = Math.floor( blight_meter );
				blight_meter -= cell.blight_checks;
				if( cell.blight_checks > 0 ) {
					blight_cells.push( cell );
					leg.blight_checks += cell.blight_checks;
					journey.total_blight_checks += cell.blight_checks;
				}				
			}

			/* FATIGUE */

			var fatigue_freq = blightFreqForMonth( date.getMonth() );
			fatigue_meter += days_to_cross * 1.0 / fatigue_freq;
			cell["fatigue_checks"] = Math.floor( fatigue_meter );
			fatigue_meter -= cell.fatigue_checks;
			if( cell.fatigue_checks > 0 ) {
				fatigue_cells.push( cell );
				leg.fatigue_checks += cell.fatigue_checks;
				journey.total_rolls += cell.fatigue_checks;
			}



			/*var days_per_blight = c.terrain.type.daysperroll;
			if(days_per_blight && ) {
				var rolls =  
			}*/



/*			var rdp = Math.floor( journey.total_days );
			if( true ) {
				var date = new Date( start_date );
				date.setDate( date.getDate() + rdp );
				cell["date"] = date;
				date_cells.push( cell );
				last_day_stamped = rdp;
			}
*/
//			var days_per_roll = daysPerRoll( date.getMonth());


			
//			leg.miles += cell.distance; // this might be only 5
			// time to cross
//			journey.total_rolls += days_to_cross / days_per_roll;
/*			var end_days = Math.floor(journey.total_days - begin_days);
			if( end_days > 0 ) {
				cell[ "end_date" ] = new Date( 0, start_month, start_day + end_days );
			} else {
				cell[ "end_date" ] = new Date( 0, start_month, start_day + Math.floor(begin_days));
//				console.log( cell.end_date );
			}
			date_cells.push( cell );
*/
/*			if(journey.total_days % days_per_roll == 0 ) {
				cell.fatigue_tn = cell.region.type.tn;
				fatigue_cells.push(cell);
			}
*/

		}
		
		journey.total_miles += leg.miles;
				
		// corruption checks
/*		if( leg.region.type.blight_freq ) {
			leg["blight_checks"] = Math.ceil( leg.days / leg.region.type.blight_freq );
			journey.total_blight_checks += leg.blight_checks;
		}
*/
		
		// travel checks
		leg["travel_tn"] = leg.region.type.tn;
		
		// remove locations for now
				
		
		if(i == journey.length - 1) { // this is the last leg
			var end_cell = leg.cells[leg.cells.length - 1];
		}
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
	displayDates( sorted_cells );
	addNotation( fatigue_cells, fatigueNotationForCell, {"class":"fatigue", "x":0, "y":-6, "color":"#000088"});
	addNotation( blight_cells, blightNotationForCell, {"class":"blight", "x":0, "y":15, "color":"#880000"});
	
	
	// now build the div
	$("#journey div").remove();
	
	// first the header
	document.getElementById("journey").appendChild( createJourneyHeaderDiv(journey) );

	for(var i=0;i<journey.length;i++) {
		var leg = journey[i];
		document.getElementById("journey").appendChild( createJourneyLegDiv( leg ) );
	}
}

function resolveRegionsFor( list ) {
	// first handle the easy ones
	for(var i=0;i<list.length;i++) {
		var cell = list[i];
		if( cell.regions.length == 1) {
			cell.region = cell.regions[0];
		}
	}
	recurseResolveRegionsFor( list );
}

function recurseResolveRegionsFor( list ) {
	var resolved = 0;
	var changed = 0;
	for(var i=0;i<list.length;i++) {
		var cell = list[i];
		if( cell.region != undefined ) {
			resolved++;
		} else {
			var prev = undefined;
			var next = undefined;
			if( i > 0 ) {
				prev = list[i-1].region;
			}
			if( i < list.length - 1 ) {
				next = list[i+1].region;
			}
			if( cell.regions.indexOf( prev ) != -1 ) {
				cell.region = prev;
			} else if ( cell.regions.indexOf( next ) != -1 ) {
				cell.region = next;
			}
			if( cell.region != undefined ) {
				changed++;
			}
		}
	}
	if( resolved < list.length ) {
		if (changed == 0) {
			list[0].region = list[0].regions[0];			
		}
		recurseResolveRegionsFor( list );
	} 
}

function createJourneyHeaderDiv( journey ) {
	var div = document.createElement("div");
	div.className = "journey_header";
	var title_label = document.createElement("label");
	title_label.className = "journey_title";
	var start_leg = journey[0];
	var end_leg = journey[journey.length - 1];
	var title = (start_leg.start ? start_leg.start.name : start_leg.region.name) + " to " + (end_leg.end ? end_leg.end.name : end_leg.region.name );
	title_label.appendChild( document.createTextNode( title ));
	div.appendChild( title_label );
	var labels = ["Total Distance: ","Total Duration: ", "Fatigue checks: ", "Blight checks: "];
	var units = ["miles","days","", ""];
	var values = ["total_miles", "total_days", "total_rolls", "total_blight_checks"];
	for(var i=0;i<4;i++) {
		var data_div = document.createElement("div");
		data_div.className = "journey_summary_data_div"
		var data_label = document.createElement("label");
		data_label.className = "journey_summary_label";
		data_label.appendChild( document.createTextNode( labels[i]));
		data_div.appendChild( data_label );
		var data_value = document.createElement("label");
		data_value.className = (values[i] == "total_rolls" ? "journey_fatigue_value" : "journey_summary_value");
		data_value.appendChild( document.createTextNode( journey[values[i]] + " " + units[i]));
		data_div.appendChild( data_value );
		div.appendChild( data_div );
	}
	return div;
}

function createJourneyLegDiv( leg ) {
	var div = document.createElement("div");
	div.className = "journey_leg_div";
	var title_label = document.createElement("label");
	title_label.className = "journey_leg_title";
	var from_name, to_name;
	if( leg.start || leg.end ) {
		if( leg.start ) {
			from_name = leg.start.name;
		} else if ( leg.prev ) {
			from_name = leg.prev;
		} else {
			from_name = leg.region.name;
		}

		if( leg.end ) {
			to_name = leg.end.name;
		} else if ( leg.next ) {
			to_name = leg.next;
		} else {
			to_name = leg.region.name;
		}
		title = from_name + " to " + to_name;
	} else {
		prep = "";
		if( leg.miles < 30 ) {
			if( leg.position == "first" ) {
				prep = "Out of";
			} else if ( leg.position == "only" ) {
				prep = "In"
			} else {
				prep = "Into";
			}
		} else if (leg.miles > 60 ) {
			prep = "Across";
		} else {
			prep = "Through";
		}
		title = prep + " " + leg.region.name;
	}
	title_label.appendChild( document.createTextNode( title ));
	div.appendChild( title_label );
	
	var distance_label = document.createElement("div");
	distance_label.className = "journey_leg_entry";
	distance_label.innerHTML = "<span class='journey_leg_value'>" + leg.miles + "</span> miles, " + "<span class='journey_leg_value'>" + leg.days + "</span> days";
	div.appendChild( distance_label );
	
	var travel_check_label = document.createElement("div");
	travel_check_label.className = "journey_leg_entry";
	travel_check_label.innerHTML = "Fatique checks: <span class='journey_fatigue_value'>" + leg.travel_rolls + "</span> (TN: <span class='journey_leg_value'>" + leg.travel_tn + "</span>)";
	div.appendChild( travel_check_label );
	
	if( leg.corruption_rolls ) {
		var corruption_check_label = document.createElement("div");
		corruption_check_label.className = "journey_leg_entry";
		corruption_check_label.innerHTML = "Blight checks: <span class='journey_blight_value'>" + leg.blight_checks + "</span> (TN: <span class='journey_leg_value'>" + leg.corruption_tn + "</span>)";
		div.appendChild( corruption_check_label );		
	}
	
	/*
	var l_keys = Object.keys(leg.loi);
	if( l_keys.length > 0 ) {
		var loi = document.createElement("div");
		loi.className = "journey_leg_entry";
		loi.style = "max-width:200px";
		var html = "Passes near: ";
		for(var key in l_keys) {
			var loc = leg.loi[l_keys[[key]]];
			html += loc.name + ", ";
		}
		html = html.substring( 0, html.length - 2 );
		loi.innerHTML = html
		div.appendChild( loi );				
	}
	*/
	
	return div;
}

function createTableRow( arrayOfElements ) {
	var tr = document.createElement( "tr" );
	tr.className = "me_table_row";
	for(var i=0;i<arrayOfElements.length;i++) {
		var td = document.createElement("td");
		td.className = "me_table_item";
		td.appendChild( document.createTextNode( arrayOfElements[i] ));
		tr.appendChild( td );
	}
	return tr;
}



/**** PATH TRAVERSAL ******/

function sortedCellsNew() {

	var cells = [];

	for(var i=0;i<SELECTED_CELLS.length;i++) {
		var cell = SELECTED_CELLS[i];
		var q = cell.q;
		var r = cell.r;
		var new_cell = {"q":q, "r":r};
		new_cell["distance"] = 10;
		new_cell["regions"] = CELLS[q][r] // more than 1?
		new_cell["index"] = i;
		cells.push(new_cell);
	}

	var ordered_cells = startChain( cells );
	if( ordered_cells == -1 ) {
		return ordered_cells;
	}


	// check for order...should be able to fix this inside startChain
/*	for(var i=0;i<ordered_cells.length;i++) {
		if( ordered_cells[i].q == SELECTED_CELLS[0].q &&
			ordered_cells[i].r == SELECTED_CELLS[0].r ) {
			if( i > ordered_cells.length / 2 ) {
				ordered_cells.reverse();
			}

		}
	}
*/
	
	if( document.getElementById( "reverse_direction").checked ) {
		ordered_cells = ordered_cells.reverse();
	}

	ordered_cells[ordered_cells.length - 1]["isFinal"] = true;
	
	return ordered_cells;
}

function startChain( cells ) {
	// clone the array...
	var pool = cells.slice();
	// first find a cell...any cell...with only a single neighbor
	var ends = getEndCellsFromPool( pool );
	var first;
	if( ends.length < 1 ) {
		console.log("no ends");
		first = firstCellClicked(pool);
//		first = firstClicked( pool );
	} else {
		first = ends[0];
		for(var i=1;i<ends.length;i++) {
			first = closestToStart( first, ends[i], cells );
		}
	}

	if( first == undefined ) {
		console.log( "undefined 'first'");
		console.log( ends );
	}
	// remove it from pool
	pool.splice( pool.indexOf(first),1);

	return growChain( first, pool ); 
}

function closestToStart( cell1, cell2, pool ) {
	var d1 = distanceFromFirstClicked( cell1, pool );
	var d2 = distanceFromFirstClicked( cell2, pool );
	return( d1 < d2 ? cell1 : cell2 );
}

function distanceFromFirstClicked( cell, pool ) {
	var pos1 = pool.indexOf(cell);
	var pos2 = pool.indexOf( firstCellClicked(pool)); // that's a little inefficient
	return Math.abs( pos1 - pos2 );
}

function firstCellClicked( pool ) {
	var index = -1;
	for(var i=0;i<pool.length;i++){
		if( index < 0 || pool[i].index < index ) {
			index = i;
		}
	}
	return pool[index];
}

function growChain( base, pool ) {
	var neighbors = selectedNeighborsOf( base, pool );
	if( neighbors.length < 1 ) {
		a = new Array();
		a[0] = base;
		return a;
	} /*else if ( neighbors.length == 1 ) {
		console.log( neighbors );
		var neighbor = neighbors[0];
		var index = pool.indexOf( neighbor );
    	pool.splice(index, 1);
    	pool.unshift(neighbor);
    	return pool;
    } */
	// one neighbor...avoid recursion
	// one or more neighbors
	var chains = [];
	var max_chain = -1;
	for(var i=0;i<neighbors.length;i++) {
		var neighbor = neighbors[i];
		var index = pool.indexOf( neighbor );
		var new_pool = pool.slice();		
		new_pool.splice(index,1);
		chains[i] = growChain( neighbor, new_pool );
		if( max_chain < 0 || chains[max_chain].length < chains[i].length ) {
			max_chain = i;
		} /* 
		This isn't working...it's supposed to solve equal length chains by choosing the one that starts with the lowest index
		else if (chains[max_chain].length == chains[i].length ) {
			// if they are same length, find the lower index
			var m_pos = indexOfCell( chains[max_chain][0]);
			var i_pos = indexOfCell( chains[i][0]);
			max_chain = ( m_pos < i_pos ? max_chain : i );
		} */
	}
	result = chains[max_chain];
	result.unshift( base );
	return result;
}

function getEndCellsFromPool( pool ) {
	var result = [];
	for(var i=0;i<pool.length;i++) {
		if( selectedNeighborsOf(pool[i], pool).length == 1 ) {
			result.push( pool[i] );
		}
	}
	return result;
}

function selectedNeighborsOf( cell, pool ) {
	var neighbors = [];
	for(var i=0;i<pool.length;i++) {
		if( cellsAdjacent( cell, pool[i] )) {
			neighbors.push( pool[i] );
		}
	}
	return neighbors;
}


function distanceBetween( point_a, point_b ) {
//	if( !point_a || !point_b ) {
//		debugger;
//	}
	q_dist = point_a.q - point_b.q;
	r_dist = point_a.r - point_b.r;
	return Math.sqrt( q_dist * q_dist + r_dist * r_dist );
}

function cellsAdjacent( cell1, cell2 ) {
	var o = cell1.q % 2;
	var deltas = [{"q":-1,"r":(-1 + o)},{"q":0,"r":-1},{"q":1,"r":(-1 + o)},
					{"q":-1,"r":(0 + o)},{"q":0,"r":1},{"q":1,"r":(0 + o)}];
					
	for(var i=0;i<deltas.length;i++) {
		var dq = deltas[i].q;
		var dr = deltas[i].r;
		if( (cell1.q + deltas[i].q == cell2.q) && (cell1.r + deltas[i].r == cell2.r) ) {
			return true;
		}
	}

	return false;
}



