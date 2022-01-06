const express = require("express");
const cors = require("cors");
const initiateMongoServer = require("./config/db");

const user = require("./routes/user");
const note = require("./routes/note");

initiateMongoServer();

const app = express();

const PORT = process.env.PORT || 1337;

app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
	res.json({message: "Note4Me API"});
});

app.use("/user", user);
app.use("/note", note);

app.listen(PORT, (req, res) => {
	console.log(`Server started at port ${PORT}`);
});

module.exports = app;
