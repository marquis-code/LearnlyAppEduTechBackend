const express = require('express');
const { checkUser } = require("../middleware/auth.middleware");
const router = express.Router();
const upload = require("../utils/multer");
const journalController = require('../controllers/journals.controller');

router.post('/create', checkUser, upload.single("file"), journalController.createJournal);
router.get('/', checkUser, journalController.getJournals);
router.get('/:id', checkUser, journalController.getJournalById);
router.patch('/:id', checkUser, upload.single("file"), journalController.updateJournal);
router.delete('/:id', checkUser, journalController.deleteJournal);
router.post('/:authorId/:journalId/comment', checkUser, journalController.comment)

module.exports = router;
