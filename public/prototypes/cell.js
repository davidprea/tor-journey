var CELLS = [];

function Cell( theQ, theR, i ) {
	this.q = theQ;
	this.r = theR;
	this.id = i;
	this.prev = null;
	this.next = null;
	this.fatigue_tests = 0
	this.blight_checks = 0;
	this.arrival_date = null;
	this.distance = 10;
	this.speed = 20;
}

Cell.prototype = {
	constructor:Cell,

	d3: function() {
		return d3.select( this.selector() );
	},

	selector: function() {
		return ".hex_cell[q='" + this.q + "'][r='" + this.r + "']";
	},

	tn: function() {
		if( this.region() ) {
			return region().tn;
		} else {
			return 0;
		}
	},

	apparentDistance: function() {
		return this.distance * this.region().multiplier();
	},

	travelTime: function(speed) {
		return this.apparentDistance() / this.speed;
	},

	departureDate: function() {
		return new Date( 0, this.arrival_date.getMonth(), this.arrival_date.getDate() + this.travelTime(), this.arrival_date.getHours() );
	},

	hasBlightCheck: function() {
		return this.blight_checks > 0;
	},

	hasFatigueTest: function() {
		return this.fatigue_tests > 0;
	},

	neighborsIn: function(pool) {
		var neighbors = [];
		for(var i=0;i<pool.length;i++) {
			if( this.adjacentTo( pool[i] )) {
				neighbors.push( pool[i] );
			}
		}
		return neighbors;
	},


	adjacentTo: function(cell) {
		var o = this.q % 2;
		var deltas = [{"q":-1,"r":(-1 + o)},{"q":0,"r":-1},{"q":1,"r":(-1 + o)},
					{"q":-1,"r":(0 + o)},{"q":0,"r":1},{"q":1,"r":(0 + o)}];

		for(var i=0;i<deltas.length;i++) {
			if( (this.q + deltas[i].q == cell.q) && (this.r + deltas[i].r == cell.r) ) {
				return true;
			}
		}
		return false;
	},

	fatigueTestFreq: function() {

		// eventually need to update for variable date ranges
		switch( this.departureDate().getMonth() ) {
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
		console.log(this.departureDate());
		console.log( "error computing fatigueTestFreq" );
		return 0;
	},

	blightCheckFreq: function() {
		return this.region().type.blight_freq;
	},

	regions: function() {
		if( REGION_GRID[this.q] == undefined ) {
			return undefined;
		} else {
			return REGION_GRID[this.q][this.r];
		}
	},

	region: function() {
		return this.regions()[0];
	},

	dateString: function() {
		var monthNames = [ "January", "February", "March", "April", "May", "June",
		    "July", "August", "September", "October", "November", "December" ];

	//	var date = ( cell.arrival_date ? cell.arrival_date : cell.departure_date );

//		var month = monthNames[ date.getMonth() ].substring(0,3);
//		var day = date.getDate();
//		return month + " " + day;



		var arr_month = monthNames[ this.arrival_date.getMonth() ].substring(0,3)
		var arr_day = this.arrival_date.getDate();
		var dep_date = this.departureDate();
		var dep_month = monthNames[ dep_date.getMonth() ].substring(0,3)
		var dep_day = dep_date.getDate();
		dep_day = ( dep_date.getHours() == 0 ? dep_day - 1 : dep_day );

		var result = arr_month;
		result += " ";
		result += arr_day;

		if( arr_month == dep_month ) {
			if( arr_day != dep_day ) {
				result += "-" + dep_day;
			}
		} else {
			result += "-" + dep_month + " " + dep_day;
		}
		return result;
	},

	fatigueString: function() {
		return this.region().type.tn + "" + (cell.fatigue_checks > 1 ? "x" + cell.fatigue_checks : "" );
	},

	blightString: function() {
		return this.blight_checks + "x" + this.region().type.blight_dice;
	},

	idString: function() {
		return this.id;
	},


	/* LINKED LIST FUNCTIONS */
	last: function() {
		return( this.next ? this.next.last() : this );
	},

	first: function() {
		return( this.prev ? this.prev.first() : this );
	},

	setNext: function(cell) {
		if( cell ) { 
			cell.next = this.next;
			cell.prev = this;
		}
		if( this.next ) {
			this.next.prev = cell;
		}
		this.next = cell;
	},

	setPrev: function(cell) {
		if( cell ) {
			cell.prev = this.prev;
			cell.next = this;
		}
		if( this.prev ) {
			this.prev.next = cell;
		}
		this.prev = cell;
	},

	insertBefore: function(cell) {
		cell.setPrev( this );
	},

	insertAfter: function(cell) {
		cell.setNext( this );
	},

	remove: function() {
		if( prev ) {
			prev.next = this.next;
		}
		if( next ) {
			next.prev = this.prev;
		}
		this.prev = null;
		this.next = null;
	},

	/* This is not even close to perfect but will do for now */
	resolveRegions: function() {
		console.log( this.id );
		if( this.regions().length == 1 ) {
			this.region = this.regions()[0];
		} else if( this.prev ) {
			if( this.regions().indexOf( this.prev.region ) != -1 ) {
				this.region = this.prev.region;
			}
		}

		if( this.next ) {
			var r = this.next.resolveRegions();
			if( !this.region ) {
				if( this.regions().indexOf( r ) != -1 ) {
					this.region = r;
				}				
			}
		}

		if( !this.region ) {
			this.region = this.regions()[0];			
		}

		return this.region;
	}
}

