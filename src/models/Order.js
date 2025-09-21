import mongoose from "mongoose";

const generateOrderId = () => {
  return "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: generateOrderId,
    },
    shippingForm: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    paymentForm: {
      cardNumber: String,
      expiryDate: String,
      cvv: String,
      cardName: String,
    },
    shippingMethod: String,
    paymentMethod: String,
    orderItems: [
      {
        product_id: { type: String },
        productName: { type: String, required: false },
        category: { type: String, required: false },
        subCategory: { type: String, required: false },
        inStock: { type: String, required: false },
        price: { type: Number, required: false },
        discountPrice: { type: Number },
        quantity: { type: Number },
        description: { type: String },
        shirtMeter: { type: String },
        paintMeter: { type: String },
        tags: [{ type: String }],
        features: [{ type: String }],
        images: [
          {
            _id: { type: String, required: false },
            filename: { type: String, required: false },
            url: { type: String, required: false },
          },
        ],
      },
    ],
    subtotal: Number,
    shippingCost: Number,
    tax: Number,
    total: Number,
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    delivery_date: {
      type: Date,
      default: () => {
        let d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
      },
    },

  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
