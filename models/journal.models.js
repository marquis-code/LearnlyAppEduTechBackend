const mongoose = require('mongoose');

// const authorSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true },
//   affiliation: String,
//   orcidId: String
// });

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
  subjectArea: String,
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
  comments: [{
    text: String,
    date: Date,
    author: String
  }]
});

const JournalSubmission = mongoose.model('JournalSubmission', submissionSchema);

module.exports = JournalSubmission;
