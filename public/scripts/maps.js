var SCALE = 1;
var MAP_BORDER, HEX_SCALE, MAP_OFFSET, MAP_STAGGER;
var SELECTED_CELLS = [];
var MAP_META_DATA = {
	'eriador.jpg': {
		hex_scale: {'x':22.462, 'y':22.4},
		map_border: {'x':151, y:134},
		cell_offset: {'x':-0.7, 'y':0.3},
		map_offset: {'q':0, 'r':0},
		stagger: {'parity':0, 'step':0}
	},
	'wilderland.jpg': {
		hex_scale: {'x':22.462, 'y':22.4},
		map_border: {'x':172, y:132},
		cell_offset: {'x':-0.7, 'y':0.3},
		map_offset: {'q':63, 'r':1},
		stagger: {'parity':1, 'step':1}
	},
	'rohan_and_gondor.jpg': {
		hex_scale: {'x':22.462, 'y':22.4},
		map_border: {'x':175, y:148},
		cell_offset: {'x':-0.7, 'y':0.3},
		map_offset: {'q':28, 'r':49},
		stagger: {'parity':0, 'step':0}
	},
	'mordor.jpg': {
		hex_scale: {'x':22.462, 'y':22.4},
		map_border: {'x':175, y:148},
		cell_offset: {'x':-0.7, 'y':0.3},
		map_offset: {'q':76, 'r':65},
		stagger: {'parity':0, 'step':0}
	}
}
var MAP_ZOOM = 1;
var hex_data;
var hex_offsets = [];
var CURRENT_MAP = 'eriador.jpg';
var map_images = {};

function mapChanged() {
	d3.select( "#overlay" )
		.selectAll("*")
		.remove();
	
	
//	computeMapParams();
	drawGrid();
//	loadLocations();
//	loadRegions();
}

function loadRemoteMap( filename ) {
	var image = new Image();
	image.onload = function() {
		map_images[filename] = image;
		if( filename == CURRENT_MAP ) {
			displayCurrentMap(); 					
		}
	}
//	setMapType( ( filename == "valarian_map" ? 1 : 0 ));
	image.src = "maps/" + filename;			
}

function displayCurrentMap() {
	
	var image = map_images[CURRENT_MAP];
	if( image ) {  
		//startProgress();
		metadata = MAP_META_DATA[CURRENT_MAP];
		MAP_BORDER = metadata.map_border;
		HEX_SCALE = metadata.hex_scale;
		MAP_OFFSET = metadata.map_offset;
		CELL_OFFSET = metadata.cell_offset;
		MAP_STAGGER = metadata.stagger;
		
		var map = $("#map")[0];
		map.style.background = "url('" + image.src + "')";
		map.style.width = image.width + "px";
		map.style.height = image.height + "px";
		//endProgress();
	}
	mapChanged();
}

function loadMaps() {
	$.get( "/mapnames", function(json) {
		var names = JSON.parse(json);
		for(var i=0;i<names.length;i++) {
			loadRemoteMap(names[i] );
		}
	})
}



/* omg this is awful.  all those parameters need to go into an external file */
/*
function computeMapParams() {
	var scale, border, offsets;
	
	var width = $("#map").width();
	var height = $("#map").height();



	if( CURRENT_MAP == "wilderland" ) {
		var aRatio = width * 1.0 / height;
		if( aRatio < 1.45 ) {
			scale_divisor = {'x':145.69, 'y':113.13}; // 3300, 2550    145.69, 113.13
//			border_percent = {'x':0.045, 'y':0.058 };  // percent of width
			border_in_cells = {'x':6.56, 'y':6.56 };
			offsets_multiplier = {'x':0.37, 'y':0.65};
		} else {
			scale_divisor = {'x':174.95, 'y':110.9}; // 2585, 1629    145.69, 113.13
			border_in_cells = {'x':21.2, 'y':5.5 };
//			border_percent = {'x':0.115, 'y':0.06 };  // percent of width
			offsets_multiplier = {'x':0.37, 'y':0.65};
		}
	} else if ( CURRENT_MAP == "eastern_eriador" ) {
		scale_divisor = {'x':84.66, 'y':106.1}; //  1700, 2125   84.70, 105.89
//		border_percent = {'x':0.044, 'y':0.044}; // 
		border_in_cells = {'x':3.73, 'y':3.73 };
		offsets_multiplier = {'x':0.9, 'y':1.3};
	} else {
		console.log( "Invalid MAP: " + CURRENT_MAP );
		return;
	}
//	console.log("Border: " + (border_percent.x * width / (width / scale_divisor.x) ) + "," + (border_percent.y * height / (height / scale_divisor.y)));
	
	hex_offsets = [];
		
	var map = document.getElementById('map');
	HEX_SCALE = {'x':width / scale_divisor.x, 'y':height / scale_divisor.y };
	MAP_BORDER = {'x':border_in_cells.x * HEX_SCALE.x, 'y':border_in_cells.y * HEX_SCALE.y};
	MAP_OFFSET = {'x':HEX_SCALE.x * offsets_multiplier.x, 'y':HEX_SCALE.y * offsets_multiplier.y };
}
*/

