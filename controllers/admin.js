const Product = require("../models/product");
const fileHelper = require("../utils/file");

// CREATE
exports.postAddProduct = async (req, res) => {
  try {
    const { title, price, description } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(422).json({
        message: "Attached file is not an image!",
        success: false,
      });
    }

    const product = new Product({
      title,
      price,
      description,
      imageUrl: image.path,
      userId: req.userId, // from JWT
    });

    await product.save();
    res.status(201).json({
      message: "Product created successfully",
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// READ all
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, title, minPrice, maxPrice } = req.query;

    const filters = { userId: req.userId };
    if (title) {
      filters.title = { $regex: title, $options: "i" }; // case-insensitive search
    }
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filters)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filters);

    res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// READ single
exports.getProduct = async (req, res) => {
  const id = req.params.productId;
  console.log("By id ran");
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }
    res.status(200).json({
      message: "Product fetched successfully",
      success: true,
      data: product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// UPDATE
exports.postEditProduct = async (req, res) => {
  const prodId = req.params.productId;
  try {
    const { title, price, description } = req.body;
    const image = req.file;

    const product = await Product.findById({ _id: prodId, userId: req.userId });
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    if (product.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized", success: false });
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
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// DELETE
exports.postDeleteProduct = async (req, res) => {
  try {
    const prodId = req.params.productId;

    const product = await Product.findOne({ _id: prodId, userId: req.userId });
    if (!product) {
      return res.status(404).json({
        message: "Product not found or not authorized",
        success: false,
      });
    }

    fileHelper.deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: prodId, userId: req.userId });

    res
      .status(200)
      .json({ message: "Product deleted successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};
