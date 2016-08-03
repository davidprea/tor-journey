function Journey() {
    Journey.JOURNEY = this;
    this.legs = [];
    this.start = null;
}

Journey.prototype = {
    constructor: Journey,
//    Journey.JOURNEY = null,

    addLeg:function(leg) {
        this.legs.push(leg);
    },

    allCells:function() {
        var result = [];
        for(var i=0;i<this.legs.length;i++) {
            result = result.concat( this.legs[i].cells );
        }
//        result.unshift(this.start);
        return result;
    },

    travelTime: function() {
        var result = 0;
        for(var i=0;i<legs.length;i++) {
            result += legs[i].travelTime();
        }      
    },

    fatigueTests: function() {
        var result = 0;
        for(var i=0;i<this.legs.length;i++) {
            result += this.legs[i].fatigueTests();
        }
        return result;
    },

    blightChecks: function() {
        var result = 0;
        for(var i=0;i<this.legs.length;i++) {
            result += this.legs[i].blightChecks();
        }
        return result;
    },

    fatigueCells: function() {
        var result = [];
         for(var i=0;i<this.legs.length;i++) {
            result = result.concat( this.legs[i].fatigueCells());
        }       
        return result;
    },

    blightCells: function() {
        var result = [];
         for(var i=0;i<this.legs.length;i++) {
            result = result.concat( this.legs[i].blightCells() );
        }     
        return result;  
    }
}

