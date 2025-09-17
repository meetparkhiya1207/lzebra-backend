import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import TempCustomer from "../models/TempCustomer.js";

dotenv.config();
// OTP generate
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateOtpEmail = (name, otp) => {
  return {
    subject: "🔐 Your OTP Code for Secure Verification",
    html: `
      <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <div style="background:#5A3A1B; color:#fff; text-align:center; padding:16px;">
            <h2 style="margin:0;fontFamily:"'Poppins', sans-serif"">LZebra Verification</h2>
          </div>

          <div style="padding:24px;">
            <p style="font-size:16px; color:#5A3A1B;fontFamily:"'Poppins', sans-serif"">Hello <strong>${name}</strong>,</p>
            
            <p style="font-size:15px; color:#5A3A1B; fontFamily:"'Poppins', sans-serif"">
              Thank you for registering with <b>LZebra</b>.  
              To complete your sign-up process, please use the OTP code below:
            </p>

            <div style="text-align:center; margin:20px 0;">
              <div style="display:inline-block; background:#5A3A1B; padding:16px 32px; border:1px solid #5A3A1B; border-radius:6px;">
                <span style="font-size:28px; font-weight:bold; color:#fff; letter-spacing:4px;">${otp}</span>
              </div>
            </div>

            <p style="font-size:14px; color:#5A3A1B; fontFamily:"'Poppins', sans-serif"">
              ⚠️ This OTP is valid for <b>45 seconds</b>.  
              If you did not request this, please ignore this email.
            </p>

            <p style="font-size:14px; color:#5A3A1B; margin-top:32px;fontFamily:"'Poppins', sans-serif"">
              Regards,<br/>
              <b>LZebra Security Team</b>
            </p>
          </div>

          <div style="background:#f9f9f9; padding:12px; text-align:center; font-size:12px; color:#888;">
            © ${new Date().getFullYear()} LZebra. All rights reserved.
          </div>
        </div>
      </div>
    `
  };
};
const generateResetLinkEmail = (name, resetUrl) => {
  return {
    subject: "🔐 Reset Your LZebra Account Password",
    html: `
      <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:#5A3A1B; color:#fff; text-align:center; padding:16px;">
            <h2 style="margin:0; font-family:'Poppins', sans-serif;">LZebra Security</h2>
          </div>

          <!-- Body -->
          <div style="padding:24px;">
            <p style="font-size:16px; color:#5A3A1B; font-family:'Poppins', sans-serif;">
              Hello <strong>${name}</strong>,
            </p>
            
            <p style="font-size:15px; color:#5A3A1B; font-family:'Poppins', sans-serif;">
              We received a request to reset your <b>LZebra</b> account password.  
              Click the button below to securely set a new password:
            </p>

            <!-- Button -->
            <div style="text-align:center; margin:30px 0;">
              <a href="${resetUrl}" target="_blank" style="background:#5A3A1B; color:#fff; text-decoration:none; padding:14px 32px; border-radius:6px; font-size:16px; font-weight:bold; font-family:'Poppins', sans-serif; display:inline-block;">
                Reset Password
              </a>
            </div>

            <p style="font-size:14px; color:#5A3A1B; font-family:'Poppins', sans-serif;">
              ⚠️ This link is valid for <b>15 minutes</b>. After that, you’ll need to request a new reset link.
            </p>

            <p style="font-size:14px; color:#5A3A1B; margin-top:32px; font-family:'Poppins', sans-serif;">
              If you did not request this change, you can safely ignore this email.
            </p>

            <p style="font-size:14px; color:#5A3A1B; font-family:'Poppins', sans-serif;">
              Regards,<br/>
              <b>LZebra Security Team</b>
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f9f9f9; padding:12px; text-align:center; font-size:12px; color:#888;">
            © ${new Date().getFullYear()} LZebra. All rights reserved.
          </div>
        </div>
      </div>
    `
  };
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "developermeet1207@gmail.com",
    pass: "iayvhrgaibwoiptp",
  },
  logger: true,
  debug: true,
  tls: {
    rejectUnauthorized: false,
  }
});
const tempUsers = {};

export const customerRegister = async (req, res) => {
  try {
    const { customer_firstName, customer_lastName, customer_email, customer_password, customer_confirmPassword, customer_agreeToTerms } = req.body;

    // Check if email already exists in main DB
    const existing = await Customer.findOne({ customer_email });
    if (existing) {
      return res.status(200).json({ success: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(customer_password, 10);
    const hashedCPassword = await bcrypt.hash(customer_confirmPassword, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 45 * 1000;

    // Store in temporary object
    tempUsers[customer_email] = {
      customer_firstName,
      customer_lastName,
      customer_email,
      customer_password: hashedPassword,
      customer_confirmPassword: hashedCPassword,
      customer_agreeToTerms,
      otp,
      otpExpires,
    };

    let tempUser = await TempCustomer.findOne({ customer_email: customer_email });
    if (tempUser) {
      tempUser.password = hashedPassword;
      tempUser.otp = otp;
      tempUser.otpExpires = otpExpires;
      await tempUser.save();
    } else {
      // Create new temp user
      tempUser = new TempCustomer({
        customer_firstName,
        customer_lastName,
        customer_email,
        customer_password: hashedPassword,
        customer_confirmPassword: hashedCPassword,
        customer_agreeToTerms,
        otp,
        otpExpires,

      });
      await tempUser.save();
    }
    const mailContent = generateOtpEmail(`${customer_firstName} ${customer_lastName}`, otp);

    await transporter.sendMail({
      from: `"Lzebra" <${"developermeet1207@gmail.com"}>`,
      to: customer_email,
      subject: mailContent.subject,
      html: mailContent.html,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify to complete registration",
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const tempUser = await TempCustomer.findOne({ customer_email: email });
    if (!tempUser) {
      return res.status(400).json({ message: "No registration found" });
    }

    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (tempUser.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Save to main DB
    const newCustomer = new Customer({
      customer_firstName: tempUser.customer_firstName,
      customer_lastName: tempUser.customer_lastName,
      customer_email: tempUser.customer_email,
      customer_password: tempUser.customer_password,
      customer_confirmPassword: tempUser.customer_confirmPassword,
      customer_agreeToTerms: tempUser.customer_agreeToTerms,
      isVerified: true,
    });

    await newCustomer.save();

    await TempCustomer.deleteOne({ customer_email: email });

    res.status(200).json({ success: true, message: "Registration successful!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the customer    

    const temp = await TempCustomer.findOne({ customer_email: email });
    if (!temp) return res.status(400).json({ message: "No registration found111" });

    // Generate new OTP and expiry
    const otp = generateOTP();
    const otpExpires = Date.now() + 30 * 1000; // 30 seconds

    temp.otp = otp;
    temp.otpExpires = otpExpires;
    await temp.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "developermeet1207@gmail.com",
        pass: "iayvhrgaibwoiptp",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    
    const mailContent = generateOtpEmail(`${temp?.customer_firstName} ${temp?.customer_lastName}`, otp);

    await transporter.sendMail({
      from: `"Lzebra" <${"developermeet1207@gmail.com"}>`,
      to: email,
      subject: mailContent.subject,
      html: mailContent.html,
    });

    res.status(200).json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const customerLogin = async (req, res) => {
  const { customer_email, customer_password } = req.body;

  if (!customer_email || !customer_password) return res.status(400).json({ success: false, message: "Email & Password required" });

  try {
    const customer = await Customer.findOne({ customer_email });
    if (!customer) return res.status(200).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(customer_password, customer.customer_password);
    if (!isMatch) return res.status(200).json({ success: false, message: "Invalid password" });

    // Generate JWT token
    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, message: "Login successful", token, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {

    const { email } = req.body;
    const user = await Customer.findOne({ customer_email: email });
    if (!user) return res.status(200).json({ success: false, message: "No account found with this email" });

    // Generate reset tokensssssss
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send Email
    const mailData = generateResetLinkEmail(user.customer_firstName, resetLink);
    await transporter.sendMail({
      from: `"LZebra Security" <${"developermeet1207@gmail.com"}>`,
      to: user.customer_email,
      subject: mailData.subject,
      html: mailData.html,
    });


    res.json({ success: true, message: "Password reset link sent to your email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Reset password (validate token & update password)
export const resetPassword = async (req, res) => {
  try {
    // const { token } = req.params;
    // const { token } = req.params;
    const { password, token} = req.body;

    const user = await Customer.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(200).json({ success: false, message: "Invalid or expired token" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.customer_password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
