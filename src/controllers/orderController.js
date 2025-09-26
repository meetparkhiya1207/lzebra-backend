import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAts: -1 });
    res.status(201).json({
      success: true,
      message: "Order get successfully!",
      order: orders,
    });
  } catch (err) {
    console.error("❌ Error while fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAts: -1 });
    res.status(201).json({
      success: true,
      message: "Order get successfully!",
      order: orders,
    });
  } catch (err) {
    console.error("❌ Error while fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
};




