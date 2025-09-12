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
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);