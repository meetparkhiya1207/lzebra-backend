import express from "express";
import { customerLogin, customerRegister, forgotPassword, resendOtp, resetPassword, verifyOtp } from "../controllers/customerController.js";

const router = express.Router();

router.post("/register", customerRegister);
router.post("/login", customerLogin);
router.post("/verify-otp", verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
