const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  }],
  abstract: { type: String, required: true },
  keywords: [String],
  submissionDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['submitted', 'under review', 'accepted', 'rejected', 'revisions required'],
    default: 'submitted' 
  },
  subjectArea:  { type: String, required: true },
  manuscriptFile: {
    fileName: String,
    filePath: String,
    fileType: String,
  },
  cloudinary_id: {
    type: String,
  },
  documentPath: {
    type: String,
    required: false, // Optional, assuming not all submissions are document-based (e.g., keynote proposals might not require a document submission)
  },
  comments: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
       ref: 'JournalComments',
    }],
    required: false
  },
});

const JournalSubmission = mongoose.model('JournalSubmission', submissionSchema);

module.exports = JournalSubmission;
