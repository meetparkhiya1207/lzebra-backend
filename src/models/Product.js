import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    product_id: { type: String },
    productName: { type: String, required: false },
    category: { type: String, required: false },
    subCategory: { type: String, required: false },
    inStock: { type: String, required: false },
    price: { type: Number, required: false },
    discountPrice: { type: Number },
    description: { type: String },
    tags: [{ type: String }],   // array of string
    features: [{ type: String }],   // array of string
    images: [
      {
        _id: { type: String, required: false },
        filename: { type: String, required: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);