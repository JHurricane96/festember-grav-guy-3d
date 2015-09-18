module.exports = 
{
	"is_proxied": false,			// is the server behind a proxy?
	"env": "dev",					// what is the environment? production or development?

	"host": "localhost",
	"port": 3000,

	// database credentials.
	"database": {
		"db_name": "grav-guy-3d",
		"host": "localhost",
		"port": 27017,
		"username": "",
		"password": "",

		"TRY_AGAIN_TIME": 1000		// wait for 1000ms before retrying to connect to the db.
	}
};