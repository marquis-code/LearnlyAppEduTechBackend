const mongoose = require('mongoose');

const JournalCommentsSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  },
  journal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalSubmission',
    required: true,
  },
});

module.exports = mongoose.model('JournalComments', JournalCommentsSchema);
