const mongoose = require('mongoose');

const manuscriptSchema = new mongoose.Schema({
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
  summary: String,
  genre: {
    type: String,
    required: true
  },
  wordCount: Number,
  status: {
    type: String,
    enum: ['submitted', 'under review', 'accepted', 'rejected'],
    default: 'submitted'
  },
  publicationUrl: {
    fileName: String,
    fileType: String,
    filePath: String
  },
  cloudinary_id: {
    type: String,
  },
  documentPath: {
    type: String,
    required: false, // Optional, assuming not all submissions are document-based (e.g., keynote proposals might not require a document submission)
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

manuscriptSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  manuscriptSchema.set("toJSON", {
    virtuals: true,
  });

const Manuscript = mongoose.model('Manuscript', manuscriptSchema);

module.exports = Manuscript;
