import Client from "../models/Client.js";
import Order from "../models/Order.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const registerClient = async (req, res) => {
  try {
    const { companyName, email, password, confirmPassword, mobile } = req.body;

    // check confirm password
    if (password !== confirmPassword) {
      return res.status(201).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // check existing client
    const existingClient = await Client.findOne({ $or: [{ email }, { mobile }] });
    if (existingClient) {
      return res.status(201).json({
        success: false,
        message: "Email or Mobile already exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = new Client({
      companyName,
      email,
      mobile,
      password: hashedPassword,
    });

    await client.save();

    res.status(201).json({
      success: true,
      message: "Client registered successfully!",
      data: client,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const loginClient = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Check if mobile and password are provided
    if (!mobile || !password) {
      return res.status(201).json({
        success: false,
        message: "Mobile number and password are required",
      });
    }

    // Find client by mobile
    const client = await Client.findOne({ mobile });
    if (!client) {
      return res.status(201).json({
        success: false,
        message: "Invalid mobile number or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(201).json({
        success: false,
        message: "Invalid mobile number or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: client._id, mobile: client.mobile, email: client.email },
      JWT_SECRET,
      { expiresIn: "7d" } // token valid for 7 days
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        client: {
          id: client._id,
          companyName: client.companyName,
          email: client.email,
          mobile: client.mobile,
        },
        token,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




