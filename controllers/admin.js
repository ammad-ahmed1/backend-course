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
// READ with filters + pagination
exports.getProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, title, minPrice, maxPrice } = req.query;

    // Convert page/limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // Base filter: products only of this user
    const filter = { userId: req.userId };

    // Title search (case-insensitive regex)
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Total count for pagination
    const totalProducts = await Product.countDocuments(filter);

    // Paginated data
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      data: products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};


// READ single
exports.getProduct = async (req, res) => {
  console.log("By id ran");
  try {
    const product = await Product.findById(req.params.productId);
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
  try {
    const { title, price, description } = req.body;
    const image = req.file;

    const product = await Product.findOne({
        _id: req.query.productId,
        userId: req.userId,
      });
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
