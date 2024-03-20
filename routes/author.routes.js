const express = require('express');
const { checkUser } = require("../middleware/auth.middleware");
const router = express.Router();
const upload = require("../utils/multer");
const authorController = require('../controllers/author.controller');

router.post('/create', upload.single('file'), authorController.createAuthor);
router.get('/list', authorController.getAuthors);
router.get('/:id', authorController.getAuthorById);
router.patch('/edit/:id',  checkUser, upload.single("file"), authorController.updateAuthor);
router.delete('/remove/:id', checkUser, authorController.deleteAuthor);

module.exports = router;
