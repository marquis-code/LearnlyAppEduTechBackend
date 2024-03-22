const mongoose = require('mongoose');

const proceedingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  authors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  }],
  abstract: {
    type: String,
    required: true,
  },
  keywords: [String], // Optional
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  reviewStatus: {
    type: String,
    enum: ['submitted', 'under review', 'accepted', 'rejected', 'revisions required'],
    default: 'submitted',
  },
  // Optional fields for proceedings
  presentationType: {
    type: String,
    enum: ['oral', 'poster', 'virtual', 'panel'],
  },
  session: String,
  documentPath: {
    type: String,
    required: true,
  },
  cloudinary_id: {
    type: String,
  },
  additionalFiles: [String], // Optional, for supplementary materials
  comments: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
       ref: 'ProceedingComments',
    }],
    required: false
  }, // Optional, for review comments or author responses
});

proceedingSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  proceedingSchema.set("toJSON", {
    virtuals: true,
  });


const Proceeding = mongoose.model('Proceeding', proceedingSchema);

module.exports = Proceeding;
