function drawGrid() {
	//startProgress();
	
	d3.select( "#overlay" )
		.selectAll( "*" )
		.remove();
		
	if( !hex_data ) {
		var hex_data = [];
	}
		
	var columns = ($("#map").width() - (2 * currentMap().border.x)) / currentMap().scale.x * 0.66;
	var rows = ($("#map").height() - (2 * currentMap().border.y)) / currentMap().scale.y * 0.555 + 1;
	

	for(var q=1;q<columns;q++) {
		for( var r=1;r<rows;r++) {
			hex_data.push( {'q':q, 'r':r } );
		}
	}
	drawHexes( hex_data );
	//endProgress();
	//displayExtraLocations();
}

/*
function pointToVertices( point ) {
	var string = "";
	for(var v=0;v<6;v++) {
		var angle = 2 * Math.PI / 6 * v;
		var x = point.x + HEX_SCALE * Math.cos(angle);
		var y = point.y + HEX_SCALE * Math.sin(angle);
		string += x + "," + y + " ";
	}
	return string;
}
*/

function cellLocToCenter( cell ) {
	var loc = {"q": cell.q - currentMap().origin.q, "r": cell.r - currentMap().origin.r};
	var point = gridLocToCenter( loc );
	return point;
}

function translateStringForCell( cell ) {
	var point = cellLocToCenter( cell );
	return "translate(" + point.x + ", " + point.y + ")";
}

function gridLocToCenter( loc ) {
	var xpos = Math.floor( currentMap().scale.x * 3 / 2 * loc.q  + currentMap().border.x + currentMap().offset.x );
	var stagger = (loc.q + currentMap().parity) % 2 * currentMap().step;
	var ypos = Math.floor( currentMap().scale.y * Math.sqrt(3) * (loc.r + stagger + (loc.q % 2 / 2.0)) + currentMap().border.y + currentMap().offset.y );
	return {'x':xpos, 'y':ypos };
}

function gridLocToVertices( location, scale ) {
	var center = gridLocToCenter( location );
	var radius = scale * currentMap().scale.x; // this still gets multiplied for every cell

	if( hex_offsets.length == 0 ) {
		for(var v=0;v<6;v++) {
			var angle = 2 * Math.PI / 6 * v;
			var dx = Math.cos(angle);
			var dy = Math.sin(angle);
			hex_offsets[v] = {"dx":dx, "dy":dy}
		}		
	}
	
	var string = "";
	for(var v=0;v<6;v++) {
		var x1 = center.x + (hex_offsets[v].dx * radius);
		var y1 = center.y + (hex_offsets[v].dy * radius);
		string += x1.toFixed(1) + "," + y1.toFixed(1) + " ";
	}
	return string;
}

function pointToGrid( point ) {
	var adjx = point.x - (currentMap().border.x + currentMap().offset.x);
	var adjy = point.y - (currentMap().border.y + currentMap().offset.y);
	var q = Math.round((2.0 * adjx / 3) / currentMap().scale.x);
	var stagger = (q + currentMap().parity) % 2 * currentMap().step
//	var r = (1.0/3 * Math.sqrt(3) * adjy - 1.0 / 3 * adjx) / HEX_SCALE.y;
	var r = (adjy / (currentMap().scale.y * Math.sqrt(3))) - (q%2/2.0) - stagger;
	var grid = { 'q': q, 'r': Math.round(r)};
	return grid;
}

function pointToCoords( point ) {
	var grid = pointToGrid( {"x":point[0], "y":point[1]} );
//	console.log( typeof currentMap().origin.q );
	var q = grid.q + currentMap().origin.q;
	var r = grid.r + currentMap().origin.r;
	result = {"q":q, "r":r};
	return result;
}

function fillColor( cell ) {
	return (cell.getAttribute("state") ? "yellow" : "transparent")
}

function drawHexes( data ) {	
	d3.select( "#overlay" )
		.selectAll( "polygon.hex_cell" )
		.data( data )
		.enter().append("polygon")
			.attr("points", function(d) {return gridLocToVertices(d,0.9);})
			.attr("q", function(d) {return d.q + currentMap().origin.q})
			.attr("r", function(d) {return d.r + currentMap().origin.r})
	//		.attr("region_id", function(d) {return regionIdForCell(d);})
			.attr("stroke", "transparent" )
			.attr("stroke-width", 1 )
			.attr("fill", "transparent" )
			.attr("opacity", 0.5 )
			.classed("selected", false )
			.classed("hex_cell", "true" )
			.on("mouseenter", mouseEnter )
			.on("mouseout", mouseOut )
			.on("mousedown", mouseDown )
			.on("mouseup", mouseUp )
			.style("cursor","pointer");
}

var selectTest = function(arg) {
	selectCells(arg);
}

/*
function selectCells( selection ) {
	console.log(selection);
	selection
		.attr( "stroke", "yellow" )
		.attr( "stroke-width", 2 )
		.attr( "opacity", function() { return (d3.select(this).attr( "selected" ) == "true" ? 0.5 : 0.25 );} )
		.attr( "fill", function() { return (d3.select(this).attr( "selected" ) == "true" ? "yellow" : "white" );} );
}

function revertCells( selection ) {
	selection
		.attr( "opacity", function() { return (d3.select(this).attr( "selected" ) == "true" ? 0.5 : 0.25 );} )
		.attr( "stroke-width", 1 )
		.attr( "stroke", "transparent" ) // function() { return (checkbox.checked ? "red" : "transparent" );}) 
		.attr( "fill", function() { return (d3.select(this).attr( "selected" ) == "true" ? "yellow" : "transparent" );});

}*/

function updateAppearance( selection ) {
	selection
		.each( function() {
			var selected = d3.select(this).classed("selected");
			d3.select(this)
				.attr( "opacity", function() { return (selected ? 0.25 : 0 ); })
				.attr( "fill", function() { return (selected ? "white" : "transparent"); })
				.attr( "stroke", function() { return (selected ? "grey" : "transparent"); })  // function() { return (checkbox.checked ? "red" : "transparent" );}) 
				.attr( "stroke-width", function() { return (selected ? 2 : 1); })
		})
	
}

function selectorForCoords( q, r ) {
	return ".hex_cell[q='" + q + "'][r='" + r + "']";
}

function cellAtCoords( q, r ) {
	return d3.select( selectorForCoords( q, r ));
}

function cellAtPoint( point ) {
	var coords = pointToCoords( point );
	return cellAtCoords( coords.q, coords.r );
}

function setUpBlurFilter() {
	// filters go in defs element
	var defs = d3.select("svg").append("defs");

	// create filter with id #drop-shadow
	// height=130% so that the shadow is not clipped
	var filter = defs.append("filter")
	    .attr("id", "drop-shadow")
	    .attr("height", "130%");

	// SourceAlpha refers to opacity of graphic that this filter will be applied to
	// convolve that with a Gaussian with standard deviation 3 and store result
	// in blur
	filter.append("feGaussianBlur")
	    .attr("in", "SourceAlpha")
	    .attr("stdDeviation", 3)
	    .attr("result", "blur");

	// translate output of Gaussian blur to the right and downwards with 2px
	// store result in offsetBlur
	filter.append("feOffset")
	    .attr("in", "blur")
	    .attr("dx", 2)
	    .attr("dy", 2)
	    .attr("result", "offsetBlur");

	// overlay original SourceGraphic over translated blurred opacity by using
	// feMerge filter. Order of specifying inputs is important!
	var feMerge = filter.append("feMerge");

	feMerge.append("feMergeNode")
	    .attr("in", "offsetBlur")
	feMerge.append("feMergeNode")
	    .attr("in", "SourceGraphic");
}


/*function revertCellByCoords( q, r ) {
	revertCells( d3.select(selectorForCoords(q,r)));
}*/

function revertAllCells() {
	changeSelectionState( d3.selectAll(".hex_cell"), false );
}

function neighborsOf( cell ) { 
	result = [];
	var q = parseInt( cell.attr("q"));
	var r = parseInt( cell.attr("r"));
	var offset = ( q % 2 == 0 ? -1 : 0 );
	var deltas = [[-1,offset],[-1,1 + offset],[0,-1],[0,1],[1, offset],[1,1 + offset]];
	for(var i=0;i<deltas.length;i++) {
		var newq = q + deltas[i][0];
		var newr = r + deltas[i][1];
		neighbor = cellAtCoords( newq, newr );
		if( neighbor != null && neighbor.size() > 0) {
			result.push( neighbor );
		}	
	}
	return result;
}

function fillCells( cell, mode ) {  // selection should be a single cell
	changeSelectionState( cell, mode );
	var offset = ( cell.q % 2 == 0 ? -1 : 0 );
	var neighbors = neighborsOf( cell );
	for(var i=0;i<neighbors.length;i++) {
		var neighbor = neighbors[i];
		if( neighbor.classed("selected") != mode ) {
			fillCells( neighbors[i], mode );			
		}
	}
}

function getSelectedCells() {
	return d3.selectAll( ".hex_cell.selected");
}

function dateStringsFromCell( cell ) {
	var monthNames = [ "January", "February", "March", "April", "May", "June",
	    "July", "August", "September", "October", "November", "December" ];

	var month = monthNames[ cell.date.getMonth() ].substring(0,3);
	var day = cell.date.getDate();
	return month + " " + day;
	/*
	var start_month = monthNames[ cell.begin_date.getMonth() ].substring(0,3)
	var start_day = cell.begin_date.getDate();
	var end_month = monthNames[ cell.end_date.getMonth() ].substring(0,3)
	var end_day = cell.end_date.getDate();

	results = [];

	if( start_month != end_month ) {
		result[0] = start_month + " " + start_day;
		result[1] = end_month + " " + end_day;
	} else {
		if( start_day != end_day ) {
			result[0] = start_month;
			result[1] = start_day + " - " + end_day;
		} else {
			result[0] = start_month;
			result[1] = start_day;
		}
	}
	return result;
	*/
}

function displayDates( data ) {

	// var first_and_last = [ data[0], data[data.length-1] ];

	d3.select( "#overlay")
		.selectAll( "g.date" )
		.remove();

	var p = d3.select("#overlay")
		.selectAll("g.date")
		.data(data)
		.enter().append("g")
			.classed("date",true)
			.classed("inner_date", function(d,i) { return i > 0 && i < data.length - 1})
			.attr("q", function(d) { return d.q } )
			.attr("r", function(d) { return d.r } )
			.attr("opacity", function(d,i) {return (i == 0 || i == data.length - 1 ? 0.7 : 0.0 )})
			.attr( "transform", function(d) { return translateStringForCell(d) } )
//			.on("mouseenter", mouseEnter )
//			.on("mouseout", mouseOut )
//			.on("mousedown", mouseDown )
//			.on("mouseup", mouseUp )

	// build points string
	var center = { "x": 0, "y": 0 };
	var radius = currentMap().scale.y * 0.9	
	var points = "";
	for(var v=0;v<6;v++) {
		var x1 = center.x + (hex_offsets[v].dx * radius);
		var y1 = center.y + (hex_offsets[v].dy * radius);
		points += x1.toFixed(1) + "," + y1.toFixed(1) + " ";
	}

	p.append("polygon")
			.attr("points", points )
			.attr("fill","lightyellow")//function(d,i) { return ( i == 0 ? "red" : "green" )})
			.attr("stroke","none")
			.attr("stroke-width",0);

	p.append("text")
		.classed( "cell_date", "true" )
		.attr("x", 0 ) // function(d) {return cellLocToCenter(d).x; })
		.attr("y", 3 ) // function(d) {return cellLocToCenter(d).y + 3; })
		.attr("font-size", function() {return currentMap().scale.y / 2;} )
		.html( function(d) {return dateStringsFromCell(d);})
		.attr("text-anchor","middle");



	/*p.append("text")
		.classed( "cell_date", "true" )
		.attr("x", 0 ) // function(d) {return cellLocToCenter(d).x; })
		.attr("y", 10 ) // function(d) {return cellLocToCenter(d).y + 3; })
		.attr("font-size", function() {return HEX_SCALE.y / 2;} )
		.html( function(d) {return dateStringsFromCell(d)[1];})
		.attr("text-anchor","middle")
	*/

//		.style("filter", "url(#drop-shadow)")
//		.attr("font-size", 10);
		
//	s.exit().remove(); 
}

function fatigueNotationForCell( cell ) {
	return cell.region.type.tn + "" + (cell.fatigue_checks > 1 ? "x" + cell.fatigue_checks : "" );
}

function blightNotationForCell( cell ) {
	return cell.blight_checks;
}

function addNotation( cells, text_function, params ) {
		d3.select( "#overlay")
		.selectAll( "g." + params.class )
		.remove();

	var p = d3.select("#overlay")
		.selectAll("g." + params.class)
		.data(cells)
		.enter().append("g")
			.classed(params.class,true)
			.attr("q", function(d) { return d.q } )
			.attr("r", function(d) { return d.r } )
			.attr( "transform", function(d) { return translateStringForCell(d) } )


	p.append("text")
		.html(text_function )
		.attr("fill", params.color )
		.style("font-size", 11 )
		.style("font-weight", "bold" )
		.style("font-family", "helvetica")
		.attr("x", params.x )
		.attr("y", params.y )
		.attr("text-anchor","middle");
}

/* TESTING FUNCTION */
function numberCells(cells) {
	
	d3.select( "#overlay")
		.selectAll( "polygon.number" )
		.remove();

	var p = d3.select("#overlay")
		.selectAll("polygon.number")
		.data(cells)
		.enter().append("polygon")
			.classed("number","true")
//			.attr("x", function(d) {return cellLocToCenter(d).x + 10; })
//			.attr("y", function(d) {return cellLocToCenter(d).y + 10; })
			.attr("points", function(d) {return gridLocToVertices(d, 0.5);})
			.attr("fill","white")
			.attr("stroke","black")
			.attr("stroke-width",4)
			.attr("opacity",0.5)
			.on("mouseenter", mouseEnter )
			.on("mouseout", mouseOut )
			.on("mousedown", mouseDown )
			.on("mouseup", mouseUp );


/*

	d3.select( "#overlay" )
		.selectAll("text")
		.remove();
	
	var s = d3.select( "#overlay" )
		.selectAll( "text" )
		.data(cells);
				
	s.enter().append("text")
		.classed( "cell_date", "true" )
		.attr("x", function(d) {return cellLocToCenter(d).x; })
		.attr("y", function(d) {return cellLocToCenter(d).y + 3; })
		.attr("font-size", function() {return HEX_SCALE.y / 2;} )
		.text( function(d,i) {return i;})
		.on("mouseenter", mouseEnter )
		.on("mouseout", mouseOut )
		.on("mousedown", mouseDown )
		.on("mouseup", mouseUp )
		.attr("text-anchor","middle");
//		.attr("stroke", "saddlebrown" )
//		.attr("font-size", 10);
		
	s.exit().remove();
*/
}

function drawJourney( sortedCells ) {
	// filters go in defs element

	var data = [];
	for(var i=0;i<sortedCells.length;i++) {
		data.push( cellLocToCenter( sortedCells[i] ) );
	}

	var lineFunction = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; })
		.interpolate("basis"); 

		d3.select("#overlay").selectAll("path.journey").remove();


	var journey = d3.select("svg").append("path")
		.attr("d", lineFunction(data))
		.classed("journey",true)
		.on("mouseenter", mouseEnter )
		.on("mouseout", mouseOut )
		.on("mousedown", mouseDown )
		.on("mouseup", mouseUp )
}





