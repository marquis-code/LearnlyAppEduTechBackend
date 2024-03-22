const express = require('express');
const { checkUser } = require("../middleware/auth.middleware");
const router = express.Router();
const upload = require("../utils/multer");
const manuscriptController = require('../controllers/manuscript.controller');
// const upload = require('../utils/uploadConfig');

router.post('/create',checkUser, upload.single('file'), manuscriptController.createManuscript);
router.get('/',checkUser, manuscriptController.getManuscripts);
router.get('/:id',checkUser, manuscriptController.getManuscript);
router.patch('/:id',checkUser, upload.single("file"), manuscriptController.updateManuscript);
router.delete('/:id', checkUser, manuscriptController.deleteManuscript);

module.exports = router;
