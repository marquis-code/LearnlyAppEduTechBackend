const express = require('express');
const { checkUser } = require("../middleware/auth.middleware");
const router = express.Router();
const upload = require("../utils/multer");
const manuscriptController = require('../controllers/manuscript.controller');
// const upload = require('../utils/uploadConfig');

router.post('/create', upload.single('file'), manuscriptController.createManuscript);
router.get('/list', manuscriptController.getManuscripts);
router.get('/:id', manuscriptController.getManuscript);
router.patch('/edit/:id',  checkUser, upload.single("file"), manuscriptController.updateManuscript);
router.delete('/remove/:id', checkUser, manuscriptController.deleteManuscript);

module.exports = router;
