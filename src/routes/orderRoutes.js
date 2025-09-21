import express from "express";
import { createOrder, getOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/createorder", createOrder);
router.get("/getorder", getOrder);


export default router;
