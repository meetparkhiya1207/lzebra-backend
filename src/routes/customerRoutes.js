import express from "express";
import { customerLogin, customerRegister, resendOtp, verifyOtp } from "../controllers/customerController.js";

const router = express.Router();

router.post("/register", customerRegister);
router.post("/login", customerLogin);
router.post("/verify-otp", verifyOtp);
router.post('/resend-otp', resendOtp);


export default router;
