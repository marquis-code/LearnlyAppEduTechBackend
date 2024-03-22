const mongoose = require('mongoose');

const ProceedingCommentsSchema = new mongoose.Schema({
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
  proceeding: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proceeding',
    required: true,
  },
});

const ProceedingComments = mongoose.model('ProceedingComments', ProceedingCommentsSchema);

module.exports = ProceedingComments;