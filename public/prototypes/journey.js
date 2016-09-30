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
    },

    /* UI Stuff */

    getDiv: function() {
        // div
        var div = createElement("div");
        div.className = "journey_header";
        // title
        var title_label = document.createElement("label");
        title_label.className = "journey_title";
        title_label.appendChild( document.createTextNode( this.getTitle() ));
        div.appendChild( title_label );
        // fields
        var labels = ["Total Duration: ", "Fatigue checks: ", "Blight checks: "];
        var units = ["days","", ""];
        var values = [this.travelTime(), this.fatigueTests(), this.blightChecks()];
        for(var i=0;i<4;i++) {
            var data_div = document.createElement("div");
            data_div.className = "journey_summary_data_div"
            var data_label = document.createElement("label");
            data_label.className = "journey_summary_label";
            data_label.appendChild( document.createTextNode( labels[i]));
            data_div.appendChild( data_label );
            var data_value = document.createElement("label");
            data_value.className = (values[i] == "total_rolls" ? "journey_fatigue_value" : "journey_summary_value");
            data_value.appendChild( document.createTextNode( journey[values[i]] + " " + units[i]));
            data_div.appendChild( data_value );
            div.appendChild( data_div );
        }
        return div;
    },

    getTitle: function() {
        if( legs.length < 1 ) return "";
        var first_leg = legs[0];
        var last_leg = legs[legs.length - 1];
        return first_leg.originString() + " to " + last_leg.destinationString();
    }
}

