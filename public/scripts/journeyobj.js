function Journey() {
    this.legs = [];
}

Journey.prototype = {
    constructor: Journey,

    addLeg:function(leg) {
        this.legs.push(leg);
    }

    allCells:function() {
        var result = [];
        for(var i=0;i<legs.length;i++) {
            result = result.concat( legs[i].cells );
        }
        return result;
    }

    fatigueTests: function() {
        var result = 0;
        for(var i=0;i<legs.length;i++) {
            result += legs[i].fatigueTests();
        }
    }

    blightChecks: function() {
        var result = 0;
        for(var i=0;i<legs.length;i++) {
            result += legs[i].blightChecks();
        }
    }

    fatigueCells: function() {
        var result = [];
         for(var i=0;i<legs.length;i++) {
            result = result.concat( legs[i].fatigueCells() );
        }       
    }

    blightCells: function() {
        var result = [];
         for(var i=0;i<legs.length;i++) {
            result = result.concat( legs[i].blightCells() );
        }       
    }
}

