const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
      },
      imageURL: {
        type: String,
        required: true,
      },
      cloudinary_id: {
        type: String,
      },
})

productSchema.virtual("id").get(function () {
    return this._id.toHexString();
  });
  
  productSchema.set("toJSON", {
    virtuals: true,
  });

const Product = mongoose.model('Product', productSchema);

module.exports = Product