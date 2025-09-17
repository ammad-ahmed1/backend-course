// controllers/admin.js
const Product = require("../models/product");
const fileHelper = require("../utils/file");

// CREATE handler
exports.postAddProduct = async (req, res) => {
  try {
    const { title, price, description } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(422).json({
        message: "Attached file is not an image!",
        success: false,
        data: null,
      });
    }

    const imageUrl = image.path;
    const product = new Product({
      title,
      price,
      description,
      imageUrl,
      userId: req.user,
    });

    await product.save();
    res.status(201).json({
      message: "Product created successfully",
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// READ all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      data: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// READ single product (optional helper)
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "Product fetched successfully",
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// UPDATE product
exports.postEditProduct = async (req, res) => {
  try {
    const prodId = req.body.productId;
    const { title, price, description } = req.body;
    const image = req.file;

    const product = await Product.findById(prodId);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    if (product.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
        success: false,
      });
    }

    product.title = title;
    product.price = price;
    product.description = description;
    if (image) {
      product.imageUrl = image.path;
    }

    await product.save();
    res.status(200).json({
      message: "Product updated successfully",
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

// DELETE product
exports.postDeleteProduct = async (req, res) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findOne({
      _id: prodId,
      userId: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or not authorized",
        success: false,
      });
    }

    fileHelper.deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: prodId, userId: req.user._id });

    res.status(200).json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
