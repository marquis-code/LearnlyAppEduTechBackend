const mongoose = require('mongoose');

const conferenceSubmissionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  },
  submissionType: {
    type: String,
    enum: ['Research Paper', 'Workshop', 'Poster', 'Panel Discussion', 'Keynote', 'Other'],
    required: true,
  },
  abstract: {
    type: String,
    required: true,
  },
  keywords: {
    type: [String],
    required: false, // Optional
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Accepted', 'Rejected'],
    default: 'Submitted',
  },
  comments: [{
    text: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }], // Optional
  documentPath: {
    type: String,
    required: false, // Optional, assuming not all submissions are document-based (e.g., keynote proposals might not require a document submission)
  },
  cloudinary_id: {
    type: String,
  },
});

conferenceSubmissionSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  conferenceSubmissionSchema.set("toJSON", {
    virtuals: true,
  });

const ConferenceSubmission = mongoose.model('ConferenceSubmission', conferenceSubmissionSchema);

module.exports = ConferenceSubmission;
