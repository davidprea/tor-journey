var selection = [];

// "selection" == d3 selection.  "selected" == selected attribute
function changeSelectionState( selection, selected ) {
	selection.attr("selected",selected);
	updateAppearance(selection);
}