function Leg (theRegion) {
    this.region = theRegion;
    this.cells = [];
}
​
Leg.prototype = {
    constructor: Leg,
    addCell:function (cell)  {
        this.cells.push(cell)
    }
    blightChecks: function() {
        var result = 0;
        for(var i=0;i<cells.length;i++) {
            result += cells[i].blight_checks;
        }
    }
    fatigueTests: function() {
        var result = 0;
        for(var i=0;i<cells.length;i++) {
            result += cells[i].fatigue_tests;
        }
    }

    blightCells: function() {
        var result = [];
         for(var i=0;i<cells.length;i++) {
            if( cells[i].blight_checks > 0 )
            result.push( cells[i] );
        }       
    }

    fatigueCells: function() {
        var result = [];
         for(var i=0;i<cells.length;i++) {
            if( cells[i].fatigue_checks > 0 )
            result.push( cells[i] );
        }       
    }
}