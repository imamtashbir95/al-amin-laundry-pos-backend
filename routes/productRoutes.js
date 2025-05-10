const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");

router.post("/", authenticate, productController.createProduct);
router.get("/", authenticate, productController.getAllProducts);
router.get("/:id", authenticate, productController.getProductById);
router.put("/", authenticate, productController.updateProduct);
router.delete("/:id", authenticate, productController.deleteProduct);

module.exports = router;
