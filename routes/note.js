const express = require("express");
const router = express.Router();

const { check, validationResult } = require("express-validator");

const auth = require("../middleware/auth");

const Notebook = require("../model/Notebook");

router.get("/list", auth, async (req, res) => {
	try {
		const notebook = await Notebook.findOne({ownerId: req.user.id}, "notes");

		res.status(200).json(notebook.notes);
	} catch (e) {
		console.error(e.message);
		res.status(500).send("Error in fetching notes");
	}
});

router.get("/:cardId", auth, async (req, res) => {
	const cardId = req.params.cardId;

	try {
		const notebook = await Notebook.findOne({ownerId: req.user.id});

		if (notebook.notes.has(cardId)) {
			res.status(200).json(notebook.notes.get(cardId));
			return;
		}

		res.status(404).json({message: "Can't find the card with that id"});
	} catch (e) {
		console.error(e.message);
		res.status(500).send("Error in retrieving requested note");
	}
});

router.delete("/:cardId", auth, async (req, res) => {
	const cardId = req.params.cardId;

	try {
		const notebook = await Notebook.findOne({ownerId: req.user.id});

		if (await notebook.notes.has(cardId))
		{
			await notebook.notes.delete(req.params.cardId);
			await notebook.save();
			res.status(200).json({message: "Note deletion successful"});
			return;
		}

		res.status(404).json({message: "Note such note was found with that id"});

	} catch (e) {
		console.error(e.message);
		res.status(500).send("Error in deleting requested note");
	}
});

router.post(
	"/",
	auth,
	[
		check("title", "Title must be filled").exists(),
		check("content", "Content must be filled").exists()
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty())
		{
			return res.status(400).json({
				errors: errors.array()
			});
		}

		const userId = req.user.id;
		const {title, content} = req.body;

		try {
			const notebook = await Notebook.exists({ownerId: userId}) ?
				await Notebook.findOne({ownerId: userId}) :
				await Notebook.create({ownerId: userId, notes: {}});

			notebook.notes.set((notebook.lastId++).toString(), {title, content});
			await notebook.save();

			res.status(200).json({
				message: "Note insertion successful"
			});
		} catch (e) {
			console.log(e.message);
			res.status(500).send("Error in inserting requested note");
		}
	}
);

module.exports = router;
