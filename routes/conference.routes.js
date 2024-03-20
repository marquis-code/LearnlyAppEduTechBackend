const { checkUser } = require("../middleware/auth.middleware");
const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");
const conferenceSubmissionController = require('../controllers/conference.controller');

// Route to create a new submission
router.post('/submissions', checkUser, upload.single("file"), conferenceSubmissionController.createSubmission);

// Route to get all submissions
router.get('/submissions', conferenceSubmissionController.getAllSubmissions);

// Route to get a single submission by ID
router.get('/submissions/:id', conferenceSubmissionController.getSubmissionById);

// Route to update a submission by ID
router.patch('/submissions/:id', checkUser, upload.single("file"), conferenceSubmissionController.updateSubmission);

// Route to delete a submission by ID
router.delete('/submissions/:id', checkUser, conferenceSubmissionController.deleteSubmission);

module.exports = router;
