const ConferenceSubmission = require("../models/conference.models");
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");

exports.createSubmission = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ errorMessage: "Please upload conference file." });
    }

    const conferencePaper = await ConferenceSubmission.findOne({
      title: req.body.title,
    });

    if (conferencePaper) {
      return res
        .status(404)
        .json({ errorMessage: "Conference paper already exist" });
    }

    const upload_response = await cloudinary.uploader.upload(req.file.path);

    const submission = new ConferenceSubmission({
      ...req.body,
      documentPath: upload_response.secure_url,
      cloudinary_id: upload_response.public_id,
    });
    await submission.save();
    res.status(200).json({ ...submission, successMessage: "Publication saved successfully" });
  } catch (error) {
    res.status(500).json({
      errorMessage: error.message
  });
  }
};

exports.getAllSubmissions = async (req, res) => {
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
    const count = await ConferenceSubmission.countDocuments(searchQuery);
    const submissions = await ConferenceSubmission.find(searchQuery).populate('author')
    .limit(limit)
    .skip((page - 1) * limit)
    .exec();
    res.status(200).json({
      data: submissions,
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

exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await ConferenceSubmission.findById(req.params.id).populate('author');
    if (!submission) {
      return res.status(404).send();
    }
    res.status(200).send(submission);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.updateSubmission = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ errorMessage: "Invalid conference ID" });
}

  try {
    let conference = await ConferenceSubmission.findById(req.params.id);
    await cloudinary.uploader.destroy(conference.cloudinary_id);

    let result;

    if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
    }


    const submission = await ConferenceSubmission.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body, 
        documentPath: result?.secure_url || conference.documentPath,
        cloudinary_id: result?.public_id || conference.cloudinary_id
      },
      { new: true, runValidators: true }
    );
    if (!submission) {
      return res.status(404).json({ errorMessage: "Conference not found" });
    }
    return res.status(200).json({
      ...submission,
      successMessage: "Conference information was successfully updated",
  });
  } catch (error) {
    return res.status(400).send(error);
  }
};

exports.deleteSubmission = async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ errorMessage: "Invalid conference ID" });
  }
  try {
    let conference = await ConferenceSubmission.findById(_id);
    await cloudinary.uploader.destroy(conference.cloudinary_id);
    const submission = await ConferenceSubmission.findByIdAndDelete(
      req.params.id
    );
    if (!submission) {
      return res.status(404).send();
    }
    res.status(200).send(submission);
  } catch (error) {
    res.status(500).json({ error, errorMessage: "Something went wrong. Please try again." });
  }
};
