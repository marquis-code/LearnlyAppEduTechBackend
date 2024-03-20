const Manuscript = require('../models/manuscript.models');
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");

exports.createManuscript = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ errorMessage: "Please upload manuscript file." });
    }

    const manuscriptPaper = await Manuscript.findOne({
      documentPath: req.body.documentPath,
    });

    if (manuscriptPaper) {
      return res
        .status(404)
        .json({ errorMessage: "manuscript paper already exist" });
    }

    const upload_response = await cloudinary.uploader.upload(req.file.path);
    const manuscript = new Manuscript({
      ...req.body,
      documentPath: upload_response.secure_url,
      cloudinary_id: upload_response.public_id,
      // file: {
      //   fileName: req.file.filename,
      //   fileType: req.file.mimetype,
      //   filePath: req.file.path
      // }
    });
    await manuscript.save();
    res.status(200).json({ ...manuscript, successMessage: "Manuscript saved successfully" });
  } catch (error) {
    res.status(500).json({
      errorMessage: error.message
  });
  }
};


exports.getManuscripts = async (req, res) => {
    let { page = 1, limit = 10, search = "" } = req.query;
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
      const count = await Manuscript.countDocuments(searchQuery);
      const manuscripts = await Manuscript.find(searchQuery).populate('author')
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();
      res.status(200).json({
        data: manuscripts,
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

exports.getManuscript = async (req, res) => {
  try {
    const manuscript = await Manuscript.findById(req.params.id).populate('author')
    if (!manuscript) {
      return res.status(404).send();
    }
    res.status(200).send(manuscript);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateManuscript = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ errorMessage: "Invalid manuscript ID" });
}
  try {
    let manuscriptItem = await Manuscript.findById(req.params.id);
    await cloudinary.uploader.destroy(manuscriptItem.cloudinary_id);
    let result;

    if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
    }
    const manuscript = await Manuscript.findByIdAndUpdate(req.params.id, {
      ...req.body, 
      documentPath: result?.secure_url || conference.documentPath,
      cloudinary_id: result?.public_id || conference.cloudinary_id
    }, { new: true, runValidators: true });
    if (!manuscript) {
      return res.status(404).send();
    }
    return res.status(200).json({
      ...manuscript,
      successMessage: "Conference information was successfully updated",
  });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.deleteManuscript = async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ errorMessage: "Invalid manuscript ID" });
  }
  try {
    let manuscriptItem = await Manuscript.findById(_id);
    await cloudinary.uploader.destroy(manuscriptItem.cloudinary_id);
    const manuscript = await Manuscript.findByIdAndDelete(req.params.id);
    if (!manuscript) {
      return res.status(404).send();
    }
    res.status(200).send(manuscript);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
