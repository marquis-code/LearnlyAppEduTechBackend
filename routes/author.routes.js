const express = require('express');
const { checkUser } = require("../middleware/auth.middleware");
const router = express.Router();
const upload = require("../utils/multer");
const authorController = require('../controllers/author.controller');

router.post('/create',checkUser, upload.single('file'), authorController.createAuthor);
router.get('/',checkUser, authorController.getAuthors);
router.get('/:id',checkUser, authorController.getAuthorById);
router.patch('/:id',  checkUser, upload.single("file"), authorController.updateAuthor);
router.delete('/:id', checkUser, authorController.deleteAuthor);

module.exports = router;
