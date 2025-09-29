import express from "express";
import { getClients, loginClient, registerClient } from "../controllers/clientController.js";

const router = express.Router();

router.post("/register", registerClient);
router.post("/login", loginClient);
router.post("/getClients", getClients);


export default router;
