import express from "express";
import { loginClient, registerClient } from "../controllers/clientController.js";

const router = express.Router();

router.post("/register", registerClient);
router.post("/login", loginClient);


export default router;
