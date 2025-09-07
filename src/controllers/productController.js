import Product from "../models/Product.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateProductId = async () => {
  const lastProduct = await Product.findOne().sort({ createdAt: -1 });
  let newId = "PROD-0001";

  if (lastProduct && lastProduct.product_id) {
    const lastIdNum = parseInt(lastProduct.product_id.split("-")[1]);
    newId = `PROD-${String(lastIdNum + 1).padStart(4, "0")}`;
  }

  return newId;
};

export const createProduct = async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        _id: uuidv4(),
        filename: file.filename,
      }));
    }

    const {
      productName,
      category,
      subCategory,
      inStock,
      price,
      discountPrice,
      tags,
      description,
    } = req.body;

    const product_id = await generateProductId();

    const newProduct = new Product({
      product_id,
      productName,
      category,
      subCategory,
      inStock,
      price,
      discountPrice,
      tags: tags ? JSON.parse(tags) : [],
      description,
      images,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error while fetching products:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      productId,
      productName,
      category,
      subCategory,
      inStock,
      price,
      discountPrice,
      description,
      deletedImages,
      tags,
    } = req.body;

    // Parse arrays safely
    const newImages = req.files
      ? req.files.map((file) => ({
          _id: file.filename, // using filename as id
          filename: file.filename,
        }))
      : [];

    const parsedDeletedImages = deletedImages ? JSON.parse(deletedImages) : [];

    // Find product
    const product = await Product.findOne({ product_id: productId });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Delete selected images (from filesystem + db)
    if (parsedDeletedImages.length > 0) {
      parsedDeletedImages.forEach((img) => {
        const filePath = path.join(__dirname, "../uploads", String(img));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      product.images = product.images.filter(
        (img) => !parsedDeletedImages.includes(String(img.filename))
      );
    }

    // Add new uploaded images
    if (newImages.length > 0) {
      product.images.push(...newImages);
    }
    product.productName = productName || product.productName;
    product.category = category || product.category;
    product.subCategory = subCategory || product.subCategory;
    product.inStock = inStock || product.inStock;
    product.price = price || product.price;
    product.discountPrice = discountPrice || product.discountPrice;
    product.description = description || product.description;
    product.tags = tags ? JSON.parse(tags) : product.tags;

    // Save
    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Product find karo
    const product = await Product.findOne({ product_id: productId });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Product images delete karo from uploads folder
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const filePath = path.join(__dirname, "../uploads", String(img));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // DB mathi product delete
    await Product.deleteOne({ product_id: productId });

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ error: "Server error" });
  }
};




