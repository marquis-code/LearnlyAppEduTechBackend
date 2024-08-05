const Product = require('../models/product');
const cloudinary = require('../utils/cloudinary');
const apiResponse = require('../utils/api_response');
const mongoose = require('mongoose');

exports.createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return apiResponse(res, 400, 'Please upload a product image');
    }

    const existingProduct = await Product.findOne({ name: req.body.name });
    if (existingProduct) {
      return apiResponse(res, 400, `Product ${existingProduct.name} already exists`);
    }

    const uploadResponse = await cloudinary.uploader.upload(req.file.path);

    const newProduct = new Product({
      ...req.body,
      createdBy: req.user.id,
      imageURL: uploadResponse.secure_url,
      cloudinary_id: uploadResponse.public_id,
    });
    await newProduct.save();
    return apiResponse(res, 201, 'Product was saved successfully');
  } catch (error) {
    return apiResponse(res, 500, 'An error occurred while creating the product', error.message);
  }
};

exports.getProducts = async (req, res) => {
  let { page = 1, limit = 10, search = '' } = req.query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  const searchQuery = {
    $or: [
      { name: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ],
  };

  try {
    const products = await Product.find(searchQuery)
      .populate('createdBy', '-password') // Populate createdBy field with user data, excluding the password
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(searchQuery);

    return res.status(200).json({
      data: products,
      metaData: {
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit,
        totalData: count,
      },
    });
  } catch (error) {
    return apiResponse(res, 500, 'An error occurred while retrieving products', error.message);
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return apiResponse(res, 400, 'Invalid Product ID');
  }

  try {
    const product = await Product.findById(id).populate('createdBy', '-password'); // Populate createdBy field with user data, excluding the password
    if (!product) {
      return apiResponse(res, 404, 'Product does not exist');
    }
    return apiResponse(res, 200, 'Product was retrieved successfully', product);
  } catch (error) {
    return apiResponse(res, 500, 'An error occurred while retrieving the product', error.message);
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return apiResponse(res, 400, 'Invalid Product ID');
  }

  try {
    const productItem = await Product.findById(id);
    if (!productItem) {
      return apiResponse(res, 404, 'Product not found');
    }

    await cloudinary.uploader.destroy(productItem.cloudinary_id);

    let uploadResponse;
    if (req.file) {
      uploadResponse = await cloudinary.uploader.upload(req.file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
        createdBy: req.user.id,
        imageURL: uploadResponse?.secure_url || productItem.imageURL,
        cloudinary_id: uploadResponse?.public_id || productItem.cloudinary_id,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', '-password'); // Populate createdBy field with user data, excluding the password

    return apiResponse(res, 200, 'Product information was successfully updated', updatedProduct);
  } catch (error) {
    return apiResponse(res, 500, 'An error occurred while updating the product', error.message);
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return apiResponse(res, 400, 'Invalid Product ID');
  }

  try {
    const productItem = await Product.findById(id);
    if (!productItem) {
      return apiResponse(res, 404, 'Product not found');
    }

    await cloudinary.uploader.destroy(productItem.cloudinary_id);
    await Product.findByIdAndDelete(id);

    return apiResponse(res, 200, 'Product was deleted successfully');
  } catch (error) {
    return apiResponse(res, 500, 'An error occurred while deleting the product', error.message);
  }
};
