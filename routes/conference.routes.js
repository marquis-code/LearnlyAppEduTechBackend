const { checkUser } = require("../middleware/auth.middleware");
const express = require('express');
const router = express.Router();
const upload = require("../utils/multer");
const conferenceSubmissionController = require('../controllers/conference.controller');

// Route to create a new submission
router.post('/create', checkUser, upload.single("file"), conferenceSubmissionController.createSubmission);

// Route to get all submissions
router.get('/', checkUser, conferenceSubmissionController.getAllSubmissions);

// Route to get a single submission by ID
router.get('/:id', checkUser, conferenceSubmissionController.getSubmissionById);

// Route to update a submission by ID
router.patch('/:id', checkUser, upload.single("file"), conferenceSubmissionController.updateSubmission);

// Route to delete a submission by ID
router.delete('/:id', checkUser,  conferenceSubmissionController.deleteSubmission);

// Add a comment to a conference publication

router.post('/:id/comment', checkUser, conferenceSubmissionController.comment)

module.exports = router;
