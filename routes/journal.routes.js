const express = require('express');
const { checkUser } = require("../middleware/auth.middleware");
const router = express.Router();
const upload = require("../utils/multer");
const journalController = require('../controllers/journals.controller');

router.post('/create', checkUser, upload.single("file"), journalController.createJournal);
router.get('/list', journalController.getJournals);
router.get('/:id', journalController.getJournalById);
router.patch('/edit/:id', checkUser, upload.single("file"), journalController.updateJournal);
router.delete('/remove/:id', checkUser, journalController.deleteJournal);

module.exports = router;
