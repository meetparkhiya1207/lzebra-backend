import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    product_id: { type: String },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    inStock: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    description: { type: String },
    tags: [{ type: String }],   // array of string
    images: [
      {
        _id: { type: String, required: true },
        filename: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);