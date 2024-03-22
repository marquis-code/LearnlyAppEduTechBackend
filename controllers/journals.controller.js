const Journal = require('../models/journal.models');
const JournalComments  = require('../models/journalComment.models')
const Author = require('../models/author.models')
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");

exports.createJournal = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ errorMessage: "Please upload journal file." });
    }

    const journalPaper = await Journal.findOne({
      documentPath: req.body.documentPath,
    });

    if (journalPaper) {
      return res
        .status(404)
        .json({ errorMessage: "journal paper already exist" });
    }

    const upload_response = await cloudinary.uploader.upload(req.file.path);
    const journal = new Journal({
      ...req.body,
      documentPath: upload_response.secure_url,
      cloudinary_id: upload_response.public_id,
    });
    await journal.save();
    res.status(200).json({ ...journal, successMessage: "Publication saved successfully" });
  } catch (error) {
    res.status(500).json({
      errorMessage: error.message
  });
  }
};

exports.getJournals = async (req, res) => {
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
      const count = await Journal.countDocuments(searchQuery);
      const journals = await Journal.find(searchQuery).populate('authors').populate('comments')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      res.status(200).json({
        data: journals,
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

exports.getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id).populate('authors').populate('comments')
    if (!journal) {
      return res.status(404).send();
    }
    res.status(200).send(journal);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateJournal = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ errorMessage: "Invalid journal ID" });
}

  try {
    let journalItem = await Journal.findById(req.params.id);
    await cloudinary.uploader.destroy(journalItem.cloudinary_id);

    let result;

    if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
    }
    const journal = await Journal.findByIdAndUpdate(req.params.id, {
      ...req.body, 
      documentPath: result?.secure_url || conference.documentPath,
      cloudinary_id: result?.public_id || conference.cloudinary_id
    }, { new: true, runValidators: true });
    if (!journal) {
      return res.status(404).json({ errorMessage: "Journal not found" });
    }
    return res.status(200).json({
      ...journal,
      successMessage: "Conference information was successfully updated",
  });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.deleteJournal = async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ errorMessage: "Invalid journal ID" });
  }
  try {
    let journalItem = await Journal.findById(_id);
    await cloudinary.uploader.destroy(journalItem.cloudinary_id);
    const journal = await Journal.findByIdAndDelete(req.params.id);
    if (!journal) {
      return res.status(404).send();
    }
    res.status(200).send(journal);
  } catch (error) {
    res.status(500).json({ ...error, errorMessage: "Something went wrong. Please try again." });
  }
};

exports.comment = async (req, res) => {
  const { authorId, journalId } = req.params;
  const { text } = req.body;

  try {
    const journal = await Journal.findById(journalId);
    const author = await Author.findById(authorId);
    if (!journal) return res.status(404).json({errorMessage: "Couldn't find journal"});
    if (!author) return res.status(404).json({errorMessage: "Couldn't find author"});
    const comment = new JournalComments({ text, author: authorId, journal: journalId });
    await comment.save();

    journal.comments.push(comment._id);
    await journal.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).send(error.message);
  }
}