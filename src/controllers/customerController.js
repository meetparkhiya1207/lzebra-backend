import Customer from "../models/Customer.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';

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
              ⚠️ This OTP is valid for <b>30 seconds</b>.  
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

export const customerRegister = async (req, res) => {
  try {
    const { customer_firstName, customer_lastName, customer_email, customer_password, customer_confirmPassword, customer_agreeToTerms } = req.body;


    // check already existsss
    const existing = await Customer.findOne({ customer_email });
    if (existing) {
      return res.status(200).json({ success: false, message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(customer_password, 10);
    const hashedCPassword = await bcrypt.hash(customer_confirmPassword, 10);

    // generate otp
    const otp = generateOTP();
    const otpExpires = Date.now() + 30 * 1000;

    const customer = new Customer({
      customer_firstName,
      customer_lastName,
      customer_email,
      customer_password: hashedPassword,
      customer_confirmPassword: hashedCPassword,
      customer_agreeToTerms,
      otp,
      otpExpires,
    });
    await customer.save();

    // send email via nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // 👈 SSL verification bypass (fix for self-signed error)
      },
    });

    const mailContent = generateOtpEmail((customer_firstName + " " + customer_lastName), otp);

    await transporter.sendMail({
      from: `"Lzebra" <${process.env.ADMIN_EMAIL}>`,
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

    const customer = await Customer.findOne({ customer_email: email });
    if (!customer) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (customer.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > customer.otpExpires) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // OTP correct → mark customer as verified (optional)
    customer.otp = null;
    customer.otpExpires = null;
    customer.isVerified = true;
    await customer.save();

    res.status(200).json({ success: true, message: "Registration successful!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the customer
    const customer = await Customer.findOne({ customer_email: email });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Generate new OTP and expiry
    const otp = generateOTP();
    const otpExpires = Date.now() + 30 * 1000; // 30 seconds

    customer.otp = otp;
    customer.otpExpires = otpExpires;
    await customer.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailContent = generateOtpEmail(customer.customer_firstName + " " + customer.customer_lastName, otp);

    await transporter.sendMail({
      from: `"Lzebra" <${process.env.ADMIN_EMAIL}>`,
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
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
