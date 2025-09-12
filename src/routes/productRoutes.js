import express from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/productController.js";
import upload from "../middlewares/upload.js"; // 👈 use multer

const router = express.Router();

// POST /api/products
router.post("/", upload.array("images", 5), createProduct);

// GET /api/products
router.get("/", getProducts);

router.post("/update", upload.array("images", 5), updateProduct);

router.delete("/:productId", deleteProduct);

router.get("/:productId", getProductById);


export default router;
