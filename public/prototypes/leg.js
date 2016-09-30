function Leg(theRegion) {
    this.region = theRegion;
    this.cells = [];

    /* attributes */
    this.riding = false;
    this.road = false;
    this.boat = false;
    this.water_direction = 0; // -1 == upstream, 1 == downstream
    // need a boat type/speed too
}

Leg.prototype = {
    constructor: Leg,

    addCell:function (cell)  {
        this.cells.push(cell)
    },

    blightChecks: function() {
        var result = 0;
        for(var i=0;i<cells.length;i++) {
            result += cells[i].blight_checks;
        }
        return result;
    },

    fatigueTests: function() {
        var result = 0;
        for(var i=0;i<cells.length;i++) {
            result += cells[i].fatigue_tests;
        }
        return result;
    },

    blightCells: function() {
        var result = [];
         for(var i=0;i<this.cells.length;i++) {
            if( this.cells[i].hasBlightCheck() )
            result.push( this.cells[i] );
        }       
        return result;
    },

    fatigueCells: function() {
        var result = [];
         for(var i=0;i<this.cells.length;i++) {
            if( this.cells[i].hasFatigueTest()) 
            result.push( this.cells[i] );
        }   
        return result;    
    },

    travelTime: function() {
        var result = 0;
        for(var i=0;i<cells.length;i++) {
            result += cells[i].travelTime(this.speed());
        }    
        return result;  
    },

    speed: function() {
        return 10;
        // need to compute based on instance variables
    },

    extractAttributes: function() {
        /* this function will have to go through cells, count how many 
        are water, road, etc., and set leg attributes accordingly */
    },

    /* UI Stuff */
    originString: function() {
        if( cells.length < 1 ) return "no origin";
        return cells[0].region.name;
    },

     destinationString: function() {
        if( cells.length < 1 ) return "no origin";
        return cells[cells.length - 1].region.name;
    },

    getTitle: function() {
        return this.originString() + " to " + this.destinationString();
    } 
}