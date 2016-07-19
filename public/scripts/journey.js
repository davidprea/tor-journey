// "selection" == d3 selection.  "selected" == selected attribute
function changeSelectionState( selection, selected ) {
	selection.each( function(d) {
		var index = -1;
		var cell = d3.select(this);
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
	})
	
	selection.classed("selected",selected);
	updateAppearance(selection);
//	numberCells();
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

function daysPerRoll( month ) {
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
	
	var sorted_cells = sortedCells();
	
	if( sorted_cells.length < 2 ) {
		return;
	} else {
		$( "#tabs" ).tabs( "option", "active", 2 );
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

	/* DIVIDE INTO LEGS */

	var journey = [];
	var leg = null;

	for(var i=0;i<sorted_cells.length;i++) {
		var cell = sorted_cells[i];
		if( cell.region.length < 1 ) { // need a different test
			invalidJourney("Outside the Lines");
			return;
		}
		// moved to sortedCells()
//		cell["distance"] = 10.0;  
		if( $("#first_cell_rule_2").prop("checked")) {
			if( i == 0 || i == sorted_cells.length - 1) {
				cell.distance = 5.0;
			}
		}
		
		if( !leg ) {
			leg = {"cells":[]};
			leg["region"] = cell.region[0];
		}
		
		if( leg.region != cell.region[0] ) {
			journey.push( leg );
			leg = null;
			i -= 1;
		} else {
			leg.cells.push( cell );
		}
	}
	// and the final leg...
	if( leg ) {
		journey.push( leg );		
	}

	/* SET VARIABLES FOR LOOPING */
		
	var terrains = {"Easy":{"multiplier":1, "tn":12},
					"Moderate":{"multiplier":1.5, "tn":14},
					"Hard":{"multiplier":2, "tn":16},
					"Severe":{"multiplier":3, "tn":18},
					"Daunting":{"multiplier":5, "tn":20},
					"Impassable":{"multiplier":-1, "tn":0}};

	var types = {"Free Lands":{"tn":12},
				"Border Lands":{"tn":14},
				"Wild Lands":{"daysperroll":7, "tn":16},
				"Shadow Lands":{"daysperroll":1, "tn":18},
				"Dark Lands":{"daysperroll":0.5, "tn":20}};
					
	
	journey["total_rolls"] = 0;
	journey["total_c_rolls"] = 0;
	journey["total_miles"] = 0;
	journey["total_days"] = 0;
	
	/* DATES */
	var month = document.getElementById( "startmonth" ).value;
	var day = document.getElementById( "startday" ).value;
	var start_date = new Date( 0, month, day );
//	date.setDate( date.getDate() - 1 ); // does this work?
//	var end_date = new Date(0, month, day );
	var date_cells = [];

	var speed = ( document.getElementById("riding").checked ? 40 : 20 );
	
	
	/* SET LEG ATTRIBUTES */
	/* First time through just set values */
	
	var last_day_stamped = -1
	for(var i=0;i<journey.length;i++) {
		var leg = journey[i];
		leg["days"] = 0;
//		leg["region"] = regionForId(leg.region_id);
		
		if( leg.region.terrain_type == "Impassable" ) {
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
		var loi = [];  // locations of interest; reset for each leg
		
		for(var c=0;c<leg.cells.length;c++) {
			var cell=leg.cells[c];

			var rdp = Math.floor( journey.total_days );
			if( rdp > last_day_stamped ) {
				var date = new Date( start_date );
				date.setDate( date.getDate() + rdp );
				cell["date"] = date;
				date_cells.push( cell );
				last_day_stamped = rdp;
			}
			
			leg.miles += cell.distance; // this might be only 5
			// time to cross
			var apparent_distance = cell.distance * terrains[leg.region.terrain].multiplier;
			var days_to_cross = apparent_distance / speed;
			journey.total_days += days_to_cross
			leg.days += days_to_cross;
			var days_per_roll = daysPerRoll( date.getMonth());
			journey.total_rolls += days_to_cross / days_per_roll;
						
			// lois
			//loi = loi.concat( locationsAtCell( cell ));			
		}
		
		journey.total_miles += leg.miles;
				
		// corruption checks
		var type = types[leg.region.type];
		if( type.daysperroll ) {
			leg["corruption_rolls"] = Math.ceil( leg.days / type.daysperroll );
			leg["corruption_tn"] = type.tn;
			journey.total_c_rolls += leg.corruption_rolls;
		}
		
		// travel checks
		leg["travel_tn"] = terrains[leg.region.terrain].tn;
		
		// remove locations for now
		/*
		// make loi unique
		var location_set = {};
		for(var l=0;l<loi.length;l++) {
			var loc = loi[l];
			location_set[loc.id] = loc;
		}
		leg["loi"] = location_set;
		
		// now set start and end for first and last legs
		if(i == 0) { // this is the first leg
			var start_cell = leg.cells[0];
			locations = locationsAtCell( start_cell );
			if( locations.length > 0 ) {
				leg["start"] = locations[0];
			}
		}
		*/
		
		if(i == journey.length - 1) { // this is the last leg
			var end_cell = leg.cells[leg.cells.length - 1];
			/*locations = locationsAtCell( end_cell );
			if( locations.length > 0 ) {
				leg["end"] = locations[0];
			}
			if( journey.length > 1 ) {
				leg["prev"] = journey[i-1].region.name				
			}
			*/
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
	
	
	
	
	// now build the div
	$("#journey div").remove();
	
	// first the header
	document.getElementById("journey").appendChild( createJourneyHeaderDiv(journey) );

	for(var i=0;i<journey.length;i++) {
		var leg = journey[i];
		document.getElementById("journey").appendChild( createJourneyLegDiv( leg ) );
	}
	
	// last, create the date stamps
	displayDates( date_cells );
	
	
	
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
	var labels = ["Total Distance: ","Total Duration: ", "Total Travel Rolls: ", "Total Corruption Rolls: "];
	var units = ["miles","days","", ""];
	var values = ["total_miles", "total_days", "total_rolls", "total_c_rolls"];
	for(var i=0;i<4;i++) {
		var data_div = document.createElement("div");
		data_div.className = "journey_summary_data_div"
		var data_label = document.createElement("label");
		data_label.className = "journey_summary_label";
		data_label.appendChild( document.createTextNode( labels[i]));
		data_div.appendChild( data_label );
		var data_value = document.createElement("label");
		data_value.className = "journey_summary_value";
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
	travel_check_label.innerHTML = "Travel checks: <span class='journey_leg_value'>" + leg.travel_rolls + "</span> (TN: <span class='journey_leg_value'>" + leg.travel_tn + "</span>)";
	div.appendChild( travel_check_label );
	
	if( leg.corruption_rolls ) {
		var corruption_check_label = document.createElement("div");
		corruption_check_label.className = "journey_leg_entry";
		corruption_check_label.innerHTML = "Corruption checks: <span class='journey_leg_value'>" + leg.corruption_rolls + "</span> (TN: <span class='journey_leg_value'>" + leg.corruption_tn + "</span>)";
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

function sortedCells() {

	var cells = [];

	for(var i=0;i<SELECTED_CELLS.length;i++) {
		cell = SELECTED_CELLS[i];
		var q = cell.q;
		var r = cell.r;
		var new_cell = {"q":q, "r":r};
		new_cell["distance"] = 10;
		new_cell["region"] = CELLS[q][r] // more than 1?
		cells.push(new_cell);
	}

	var ordered_cells = [];
	var discard = [];
	ordered_cells.push( cells.pop() );
	
	while( cells.length > 0 ) {
		
		match_cell = cells.pop();
		var match_index = -1;
		
		
		// iterate through already ordered_cells, looking for adjacency
		for(var i=0;i<ordered_cells.length;i++) {
			ordered_cell = ordered_cells[i];
			if( cellsAdjacent( match_cell, ordered_cell )) {
				
				if( match_index >= 0 || ( i > 0 && i < ordered_cells.length - 1 )) { 
					return "Ambiguous";					
				}
				
				match_index = i;
			}
		}
		
		// if a single match was found, insert at index and replace discard pile 
		if( match_index >= 0 ) {
			if( match_index == 0 ) {
				ordered_cells.splice(match_index,0,match_cell)
			} else {
				ordered_cells.push( match_cell );
			}
			cells = cells.concat(discard);
			discard = [];
		} else { // if no matches, discard and repeat
			discard.push( match_cell );
		}
		
	}
	
	// if we got here and still no match found it means that no cells matched either first or last cell of chain	
	if( match_index < 0 ) {
		return "Discontiguous";
	}

	// check for order
	

	//var first_cell = ordered_cells[ 0 ];
	//var last_cell = ordered_cells[ordered_cells.length - 1];
	//if( distanceBetween( first_cell, first_click ) > distanceBetween( last_cell, first_click )) {
	//	ordered_cells.reverse();
	//}
	

	
	if( document.getElementById( "reverse_direction").checked ) {
//		console.log( "Reversing" );
		ordered_cells = ordered_cells.reverse();
	}
	
	ordered_cells[ordered_cells.length - 1]["isFinal"] = true;
	
	return ordered_cells;
}


function sortedSelectedCellsOld() {
	var cells = [];
//	console.log( d3.selectAll("[selected=true]").size() );
	d3.selectAll("[selected=true]").each( function(d) { 
		cell = {"q":d.q, "r":d.r};
		cell["region_id"] = parseInt(this.getAttribute("region_id"));
		cells.push( cell );
	});


	
	
//	cells.sort( function(a,b) { return (((a.q < b.q) || (a.r < b.r)) ? -1 : 1 );} );
	var ordered_cells = [];
	var discard = [];
	ordered_cells.push( cells.pop() );
	
	while( cells.length > 0 ) {
		
		match_cell = cells.pop();
		var match_index = -1;
		
		
		// iterate through already ordered_cells, looking for adjacency
		for(var i=0;i<ordered_cells.length;i++) {
			ordered_cell = ordered_cells[i];
			if( cellsAdjacent( match_cell, ordered_cell )) {
				
				if( match_index >= 0 || ( i > 0 && i < ordered_cells.length - 1 )) { 
					return "Ambiguous";					
				}
				
				match_index = i;
			}
		}
		
		// if a single match was found, insert at index and replace discard pile 
		if( match_index >= 0 ) {
			if( match_index == 0 ) {
				ordered_cells.splice(match_index,0,match_cell)
			} else {
				ordered_cells.push( match_cell );
			}
			cells = cells.concat(discard);
			discard = [];
		} else { // if no matches, discard and repeat
			discard.push( match_cell );
		}
		
	}
	
	// if we got here and still no match found it means that no cells matched either first or last cell of chain	
	if( match_index < 0 ) {
		return "Discontiguous";
	}

	// check for order
	var first_cell = ordered_cells[ 0 ];
	var last_cell = ordered_cells[ordered_cells.length - 1];
	if( distanceBetween( first_cell, first_click ) > distanceBetween( last_cell, first_click )) {
		ordered_cells.reverse();
	}

	
	if( document.getElementById( "reverse_direction").checked ) {
//		console.log( "Reversing" );
		ordered_cells = ordered_cells.reverse();
	}
	
	ordered_cells[ordered_cells.length - 1]["isFinal"] = true;
	
		
	return ordered_cells;
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
					
//	console.log( "Cells: " + cell1.q + "," + cell1.r + " " + cell2.q + "," + cell2.r );
	for(var i=0;i<deltas.length;i++) {
		var dq = deltas[i].q;
		var dr = deltas[i].r;
//		console.log( "deltas: " + dq + "," + dr );
		if( (cell1.q + deltas[i].q == cell2.q) && (cell1.r + deltas[i].r == cell2.r) ) {
			return true;
		}
	}

	return false;
}



