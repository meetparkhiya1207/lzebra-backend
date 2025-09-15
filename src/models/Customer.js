import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customer_firstName: { type: String, required: true },
    customer_lastName: { type: String, required: true },
    customer_email: { type: String, required: true, unique: true },
    customer_password: { type: String, required: true },
    customer_confirmPassword: { type: String, required: true },
    customer_agreeToTerms: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
