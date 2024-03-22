const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  conference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConferenceSubmission',
    required: true,
  },
});

module.exports = mongoose.model('Comment', commentSchema);
