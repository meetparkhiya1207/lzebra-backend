import express from "express";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/productController.js";
import upload from "../middlewares/upload.js"; // 👈 use multer

const router = express.Router();

// POST /api/products
router.post("/", upload.array("images", 5), createProduct);

// GET /api/products
router.get("/", getProducts);

router.post("/update", upload.array("images", 5), updateProduct);

router.delete("/:productId", deleteProduct);



export default router;
