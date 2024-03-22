const express = require('express');
const { checkUser } = require("../middleware/auth.middleware");
const router = express.Router();
const upload = require("../utils/multer");
const proceedingsController = require('../controllers/proceedings.controller');

router.post('/create',checkUser, upload.single("file"), proceedingsController.createProceeding);
router.get('/',checkUser, proceedingsController.getAllProceedings);
router.get('/:id',checkUser, proceedingsController.getProceedingById);
router.patch('/:id',checkUser, upload.single("file"), proceedingsController.updateProceeding);
router.delete('/:id',checkUser, proceedingsController.deleteProceeding);
router.post('/:proceedingId/:authorId/comment',checkUser, proceedingsController.comment)

module.exports = router;
