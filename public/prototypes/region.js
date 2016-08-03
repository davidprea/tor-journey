function Region( theName, theID, theType, theTerrain, coords_list ) {
	this.name = theName;
	this.type = theType;
	this.terrain = theTerrain;
	this.id = theID;
	this.coord_pairs = coords_list;
	this.addToGrid();
}

Region.prototype = {
	constructor:Cell,
	
	multiplier: function() {
		return this.terrain.multiplier;
	},

	tn: function() {
		return this.type.tn;
	},

	blightCheckFreq: function() {
		return this.type.blight_freq;
	},

	addToGrid: function() {
		for(var j=0;j<this.coord_pairs.length;j++){
			var cell = this.coord_pairs[j];
			if (REGION_GRID[cell.q] == undefined) {
				REGION_GRID[cell.q] = [];
			}
			
			if (REGION_GRID[cell.q][cell.r] == undefined ) {
				REGION_GRID[cell.q][cell.r] = [];
			}
			REGION_GRID[cell.q][cell.r].push( this );
		}
	}
}