const express = require('express');
const { verifyUser } = require("../middleware/auth.middleware");
const router = express.Router();
const upload = require("../utils/multer");
const productController = require('../controllers/product.controller');

router.post('/create',verifyUser, upload.single('file'), productController.createProduct);
router.get('/', verifyUser, productController.getProducts);
router.get('/all-products', productController.getProducts);
router.get('/:id', verifyUser, productController.getProductById);
router.patch('/:id', verifyUser, upload.single("file"), productController.updateProduct);
router.delete('/:id', verifyUser, productController.deleteProduct);

module.exports = router;
