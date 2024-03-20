const Author = require('../models/author.models');
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");

exports.createAuthor = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ errorMessage: "Please upload author profile picture." });
    }

    const author = await Author.findOne({
      email: req.body.email
    });

    if (author) {
      return res
        .status(404)
        .json({ errorMessage: "Author already exist" });
    }

    const upload_response = await cloudinary.uploader.upload(req.file.path);
    const newAuthor = new Author({
      ...req.body,
      profile_url: upload_response.secure_url,
      cloudinary_id: upload_response.public_id,
    });
    await newAuthor.save();
    res.status(200).json({ successMessage: "Author was saved successfully" });
  } catch (error) {
    res.status(500).json({
      errorMessage: error.message
  });
  }
};

exports.getAuthors = async (req, res) => {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    let searchQuery = {
      $or: [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { orcidId: new RegExp(search, 'i')}
      ]
    };

    try {
      const authors = await Author.find(searchQuery)
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();

        const count = await Author.countDocuments(searchQuery);
      res.status(200).json({
        data: authors,
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

exports.getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id)
    if (!author) {
      return res.status(404).send();
    }
    res.status(200).send(author);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateAuthor = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ errorMessage: "Invalid author ID" });
}

  try {
    let authorItem = await Author.findById(req.params.id);
    await cloudinary.uploader.destroy(authorItem.cloudinary_id);

    let result;

    if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
    }
    const author = await Author.findByIdAndUpdate(req.params.id, {
      ...req.body, 
      profile_url: result?.secure_url || conference.profile_url,
      cloudinary_id: result?.public_id || conference.cloudinary_id
    }, { new: true, runValidators: true });
    if (!author) {
      return res.status(404).json({ errorMessage: "Author not found" });
    }
    return res.status(200).json({
      ...author,
      successMessage: "Author information was successfully updated",
  });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.deleteAuthor = async (req, res) => {
  const _id = req.params.id;
  if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ errorMessage: "Invalid author ID" });
  }
  try {
    let authorItem = await Author.findById(_id);
    await cloudinary.uploader.destroy(authorItem.cloudinary_id);
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return res.status(404).send();
    }
    res.status(200).send(author);
  } catch (error) {
    res.status(500).json({ ...error, errorMessage: "Something went wrong. Please try again." });
  }
};
