const mongoose = require("mongoose");

const MONGO_URI = "mongodb://127.0.0.1:27017/note4me";

const initiateMongoServer = async () => {
	try {
		await mongoose.connect(MONGO_URI, {
			useNewUrlParser: true
		});
		console.log("Connected to DB!");
	} catch (e) {
		console.log(e);
		throw e;
	}
};

module.exports = initiateMongoServer;
