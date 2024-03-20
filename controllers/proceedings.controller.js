const Proceeding = require('../models/proceeding.models');
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");

// Create a new proceeding
exports.createProceeding = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ errorMessage: "Please upload proceeding file." });
    }

    const proceedingPaper = await Proceeding.findOne({
      documentPath: req.body.documentPath,
    });

    if (proceedingPaper) {
      return res
        .status(404)
        .json({ errorMessage: "proceeding paper already exist" });
    }

    const upload_response = await cloudinary.uploader.upload(req.file.path);
    const proceeding = new Proceeding({
      ...req.body,
      documentPath: upload_response.secure_url,
      cloudinary_id: upload_response.public_id,
    });
    await proceeding.save();
    res.status(200).json({ ...proceeding, successMessage: "Publication saved successfully" });
  } catch (error) {
    res.status(500).json({
      errorMessage: error.message
  });
  }
};

exports.getAllProceedings = async (req, res) => {
  let { page = 1, limit = 10, search, abstract } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  let searchQuery = {
    $or: [
      { title: new RegExp(search, 'i') },
      { "author.name": new RegExp(search, 'i') },
      { abstract: new RegExp(search, 'i')}
    ]
  };
  try {
    const count = await Proceeding.countDocuments(searchQuery);
    const proceedings = await Proceeding.find(searchQuery).populate('author')
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();
    res.status(200).json({
      data: proceedings,
      metaData: {
        totalPages: Math.ceil(count / limit),
        currentPage: page * 1,
        limit: limit * 1,
        totalData: count
      },
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get a single proceeding by ID
exports.getProceedingById = async (req, res) => {
  try {
    const proceeding = await Proceeding.findById(req.params.id).populate('author')
    if (!proceeding) {
      return res.status(404).send();
    }
    res.status(200).send(proceeding);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update a proceeding
exports.updateProceeding = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ errorMessage: "Invalid proceeding ID" });
}
  try {
    let proceedingItem = await Proceeding.findById(req.params.id);
    await cloudinary.uploader.destroy(proceedingItem.cloudinary_id);

    let result;

    if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
    }
    const proceeding = await Proceeding.findByIdAndUpdate(req.params.id, {
      ...req.body, 
      documentPath: result?.secure_url || conference.documentPath,
      cloudinary_id: result?.public_id || conference.cloudinary_id
    }, { new: true, runValidators: true });
    if (!proceeding) {
      return res.status(404).json({ errorMessage: "Proceedings not found" });
    }
    return res.status(200).json({
      ...proceeding,
      successMessage: "Proceeding information was successfully updated",
  });
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete a proceeding
exports.deleteProceeding = async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ errorMessage: "Invalid proceeding ID" });
  }
  try {
    let proceedingItem = await Proceeding.findById(_id);
    await cloudinary.uploader.destroy(proceedingItem.cloudinary_id);
    const proceeding = await Proceeding.findByIdAndDelete(req.params.id);
    if (!proceeding) {
      return res.status(404).send();
    }
    res.status(200).send(proceeding);
  } catch (error) {
    res.status(500).json({ ...error, errorMessage: "Something went wrong. Please try again." });
  }
};
