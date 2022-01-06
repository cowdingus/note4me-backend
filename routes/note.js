const express = require("express");
const router = express.Router();

const { check, validationResult } = require("express-validator");

const auth = require("../middleware/auth");

const Notebook = require("../model/Notebook");

router.get("/list", auth, async (req, res) => {
	try {
		const notebook = await Notebook.findOne({ownerId: req.user.id}, "notes");

		// Ensure notebook existence
		if (!notebook) {
			res.status(400).send("No such notebook with that user id was found");
			return;
		}

		// Send the list of notes
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

		// Ensure notebook existence
		if (!notebook) {
			res.status(400).send("No such notebook with that user id was found");
			return;
		}

		const note = notebook.notes.find(note => note.id == cardId);

		// Check note existence
		if (!note) {
			res.status(404).json({message: "Can't find the note with that id"});
			return;
		}

		// Send the note
		res.status(200).json(note);

	} catch (e) {
		console.error(e.message);
		res.status(500).send("Error in retrieving requested note");
	}
});

router.delete("/:cardId", auth, async (req, res) => {
	const cardId = req.params.cardId;

	try {
		const notebook = await Notebook.findOne({ownerId: req.user.id});

		// Ensure notebook existence
		if (!notebook) {
			res.status(404).send("No such notebook with that user id was found");
			return;
		}

		const note = notebook.notes.find(note => note.id == cardId);

		// Ensure note existence
		if (!note) {
			res.status(404).json({message: "Note such note was found with that id"});
			return;
		}

		// Delete the note
		notebook.notes = notebook.notes.filter(note => note.id != cardId);

		await notebook.save();
		res.status(204).end();

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
		// Check argument completeness
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
			// Create notebook if not exists
			const notebook = await Notebook.exists({ownerId: userId}) ?
				await Notebook.findOne({ownerId: userId}) :
				await Notebook.create({ownerId: userId, notes: []});

			// Push the note to notebook.notes
			await notebook.notes.push({id: notebook.lastId++, title, content});
			await notebook.save();

			res.status(204).end();
		} catch (e) {
			console.log(e.message);
			res.status(500).send("Error in inserting requested note");
		}
	}
);

router.patch(
	"/:cardId",
	auth,
	async (req, res) => {
		const userId = req.user.id;
		const cardId = req.params.cardId.toString();
		const {title, content} = req.body;

		// Check argument completeness
		if (!title && !content) {
			res.status(204).end();
		}

		try {
			const notebook = await Notebook.findOne({ownerId: userId});

			// Ensure notebook existence
			if (!notebook) {
				res.status(404).send("No such notebook with that user id was found");
				return;
			}

			const note = notebook.notes.find(note => note.id == cardId);

			// Check note existence
			if (!note) {
				res.status(400).send("No such note with that id was found");
				return;
			}

			// Update note
			if (title) {
				note.title = title;
			}

			if (content) {
				note.content = content;
			}

			await notebook.save();

			res.status(200).send("Note patched");

		} catch (e) {
			console.log(e.message);
			res.status(500).send("Error in patching requested note");
		}
	}
);

module.exports = router;
