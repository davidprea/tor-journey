function JourneyCell( cell, i ) {
	this.q = cell.q;
	this.r = cell.r;
	this.index = i;
	this.prev = null;
	this.next = null;
	this.fatigue_tests = 0
	this.corruption_tests = 0;
	this.region = null;
	this.start_date = null;
	this.end_date = null;
}

JourneyCell.prototype = {
	constructor:Cell,
	region: null,

	last: function() {
		return( this.next ? this.next.last() : this );
	}

	first: function() {
		

		return( this.prev ? this.prev.first() : this );
	}

	tn: function() {
		if( this.region ) {
			return region.tn;
		} else {
			return 0;
		}
	}

	resolveRegion: function() {
		if( !this.region ){
			// use CELLS[this.q][this.r] and prev/next to resolve recursively
		}
	}

	timeToTraverse: function(speed) {
		var apparent_distance = this.region.multiplier();
		// etc.
	}
}