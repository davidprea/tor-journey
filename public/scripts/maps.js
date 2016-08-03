var hex_offsets = []; // this is ugly
var CURRENT_MAP = -1;

function mapChanged() {
	d3.select( "#overlay" )
		.selectAll("*")
		.remove();
	
	drawGrid();
}

function loadRemoteMapOld( filename ) {
	var image = new Image();
	image.onload = function() {
		map_images[filename] = image;
		if( filename == CURRENT_MAP ) {
			displayCurrentMap(); 					
		}
	}
	image.src = "maps/" + filename;			
}

function loadRemoteMap( filename ) {
	var image = new Image();
	image.onload = function() {
		if( filename == currentMap().filename ) {
			displayCurrentMap(); 					
		}
	}
	image.src = "maps/" + filename;		
	return image;	
}

function displayCurrentMap() {
	var image = currentMap().image;
	if( image ) {  
		
		var map = $("#map")[0];
		map.style.background = "url('" + image.src + "')";
		map.style.width = image.width + "px";
		map.style.height = image.height + "px";
		//endProgress();
	}
	mapChanged();
}

function loadMaps() {

	$.get("/mapinfo.json", function(json) {
		MAPS = [];
		var data = JSON.parse(json);
		for(var i=0;i<data.length;i++) {
			var row = data[i];
			var entry = {};
			entry.name = row.name;
			if( row.name == "Eriador" ) {
				CURRENT_MAP = i;
			}
			entry.filename = row.filename;
			entry.origin = { "q":row.origin_x, "r":row.origin_y}
			entry.offset = { "x":row.offset_x, "y":row.offset_y}
			entry.step = row.step;
			entry.parity = row.parity;
			entry.border = {"x":row.border_x, "y":row.border_y}
			entry.scale = {"x":row.scale_x, "y":row.scale_y}
			entry.image = loadRemoteMap( entry.filename );
			MAPS.push(entry);
		}
	})
}

function currentMap() {
	return MAPS[ CURRENT_MAP ];
}




