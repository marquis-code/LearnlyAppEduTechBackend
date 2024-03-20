const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      affiliation: {
        type: String,
        required: false, // Optional
        trim: true,
      },
      bio: {
        type: String,
        required: false, // Optional
      },
      orcidId: {
        type: String,
        required: false, // Optional
      },
      profile_url: {
        type: String,
        required: true, // Optional, assuming not all submissions are document-based (e.g., keynote proposals might not require a document submission)
      },
      cloudinary_id: {
        type: String,
      },
})

authorSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  authorSchema.set("toJSON", {
    virtuals: true,
  });

const Author = mongoose.model('Author', authorSchema);

module.exports = Author