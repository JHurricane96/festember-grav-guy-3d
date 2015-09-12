function toArray(obj) {
	return Array.prototype.slice.call(obj);
}

//A 2D Vector "class"

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

//Adds any number of vectors

Vector.add = function () {
	if (arguments.length < 2)
		throw new Error("Not enough parameters");
	var newX = 0;
	var newY = 0;
	toArray(arguments).forEach(function (vector) {
		if (vector instanceof Vector) {
			newX += vector.x;
			newY += vector.y;
		}
		else
			throw new Error("Bad parameter(s)");
	});
	return new Vector(newX, newY);
}

//Subtracts any number of vectors. The first vector is what is subtracted from

Vector.subtract = function () {
	if (arguments.length < 2)
		throw new Error("Not enough parameters");
	if (!(arguments[0] instanceof Vector))
		throw new Error("Bad parameter(s)");
	var newX = arguments[0].x;
	var newY = arguments[0].y;
	for (var i = 1; i < arguments.length; ++i) {
		if (arguments[i] instanceof Vector) {
			newX -= arguments[i].x;
			newY -= arguments[i].y;
		}
		else
			throw new Error("Bad parameter(s)");
	}
	return new Vector(newX, newY);
}

//Makes the vector a unit vector

Vector.unit = function (vector) {
	if (!(vector instanceof Vector))
		throw new Error("Bad parameter");
	var magnitude = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
	return new Vector(vector.x/magnitude, vector.y/magnitude);
}

Vector.mag = function (vector) {
	if (!vector instanceof Vector)
		throw new Error("Bad parameter");
	return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
}

//Multiply a vector with a scalar

Vector.mult = function (vector, scalar) {
	if (!(vector instanceof Vector))
		throw new Error("Bad parameter");
	return new Vector(vector.x * scalar, vector.y * scalar);
}

Vector.dist = function (v1, v2) {
	if (!(v1 instanceof Vector) || !(v2 instanceof Vector))
		throw new Error("Bad parameter(s)");
	return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2));
}

//OO versions of above functions follow

//Adds one vector to this

Vector.prototype.add = function (vector) {
	if (!(vector instanceof Vector))
		throw new Error("Bad parameter");
	this.x += vector.x;
	this.y += vector.y;
	return this;
}

//Subtracts one vector from this

Vector.prototype.subtract = function (vector) {
	if (!(vector instanceof Vector))
		throw new Error("Bad parameter");
	this.x -= vector.x;
	this.y -= vector.y;
	return this;
}

Vector.prototype.unit = function () {
	var magnitude = Math.sqrt((this.x * this.x) + (this.y * this.y));
	this.x /= magnitude;
	this.y /= magnitude;
	return this;
}

Vector.prototype.mult = function (scalar) {
	this.x *= scalar;
	this.y *= scalar;
	return this;
}

Vector.prototype.mag = function () {
	return Math.sqrt((this.x * this.x) + (this.y * this.y));
}