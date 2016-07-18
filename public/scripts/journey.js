var selection = [];

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
			SELECTED_CELLS.push( {"q":cell.attr('q'), "r":cell.attr('r')} );
		}
	})
	
	selection.attr("selected",selected);
	updateAppearance(selection);
}