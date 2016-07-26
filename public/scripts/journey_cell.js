function Cell(q_coord, r_coord) {
	this.q = q_coord;
	this.r = r_coord;
}

Cell.prototype = {
	constructor:Cell,
	region: null,
}