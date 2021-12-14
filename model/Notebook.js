const mongoose = require("mongoose");

const NoteSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String }
});

const NotebookSchema = mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  lastId: { type: Number, default: 0 },
  notes: { type: Map, of: NoteSchema }
});

module.exports = mongoose.model("notebook", NotebookSchema);
