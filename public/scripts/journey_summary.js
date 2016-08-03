
function createJourneySummary(journey) {
	document.getElementById("journey_summary").appendChild( createJourneyHeaderDiv(journey) );

	for(var i=0;i<journey.length;i++) {
		var leg = journey[i];
		document.getElementById("journey_summary").appendChild( createJourneyLegDiv( leg ) );
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