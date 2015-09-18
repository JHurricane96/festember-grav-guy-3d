var config = require('./config');
var MongoClient = require('mongodb').MongoClient;
var db = null;

function connect_db(cb) {
	var url = "mongodb://";
		url += config.database.username + ":" + config.database.password;
		url += config.database.host;
		url += ":" + config.database.port;
		url += "/" + config.database.db_name;

	MongoClient.connect(url, cb);
}

function reuseSync() {
	return db;
}

function reuse(cb) {
	if(cb) {
		if(db) cb(db);
		else create_new(cb);
	}
	else {
		if(db) return Promise.resolve(db);
		else {
			return create_new();
		}
	}
}

function create_new(cb) {
	if(cb) {
		connect_db(cb);
	}
	else {
		return new Promise(function(resolve, reject) {
			connect_db(function(db) {
				if(db) resolve(db);
				else 	reject();
			});
		});
	}
}

connect_db(function(err,d) {
	if(err)
		throw err;
	db = d;
});

module.exports.reuse = reuse;
module.exports.create_new = create_new;