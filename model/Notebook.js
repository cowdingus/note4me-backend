const mongoose = require("mongoose");

const NoteSchema = mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now() },
  lastUpdatedAt: { type: Date, default: Date.now() },
  tags: { type: [String], default: [] },
  priority: { type: Number, default: 0 }
});

NoteSchema.pre('save', function(next) {
  this.lastUpdatedAt = Date.now();

  next();
});

const NotebookSchema = mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  lastId: { type: Number, default: 0 },
  notes: { type: [NoteSchema] }
});

module.exports = mongoose.model("notebook", NotebookSchema);
