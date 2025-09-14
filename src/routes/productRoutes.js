import express from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/productController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.array("images", 5), createProduct);

router.get("/", getProducts);

router.post("/update", upload.array("images", 5), updateProduct);

router.delete("/:productId", deleteProduct);

router.get("/:productId", getProductById);


export default router;
