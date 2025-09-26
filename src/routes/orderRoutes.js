import express from "express";
import { createOrder, getAllOrder, getOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/createorder", createOrder);
router.get("/getorder", getOrder);
router.get("/getAllorder", getAllOrder);


export default router;
