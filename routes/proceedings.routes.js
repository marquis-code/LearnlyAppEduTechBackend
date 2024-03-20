const express = require('express');
const { checkUser } = require("../middleware/auth.middleware");
const router = express.Router();
const upload = require("../utils/multer");
const proceedingsController = require('../controllers/proceedings.controller');

router.post('/create', checkUser, upload.single("file"), proceedingsController.createProceeding);
router.get('/list', proceedingsController.getAllProceedings);
router.get('/:id', proceedingsController.getProceedingById);
router.patch('/edit/:id', checkUser, upload.single("file"), proceedingsController.updateProceeding);
router.delete('/remove/:id',checkUser, proceedingsController.deleteProceeding);

module.exports = router;
