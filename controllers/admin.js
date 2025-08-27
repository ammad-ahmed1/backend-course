// controllers/admin.js
const { ValidationError } = require("sequelize");
const Product = require("../models/product");

// CREATE page
exports.getAddProduct = (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).redirect("/login"); // 401 Unauthorized
  }
  res.status(200).render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    extraCss: ["/css/forms.css"],
    editing: false,
    product: {},
    isAuthenticated: req.session.isLoggedIn,
  });
};

// CREATE handler
exports.postAddProduct = (req, res, next) => {
  console.log("In controller");
  const { title, price, description } = req.body;
  const image = req.file;
  console.log(image, "....img");
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image!",
      validationErrors: [],
    });
  }
  const imageUrl = image.path;
  console.log(image);
  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user,
  });

  product
    .save()
    .then(() => {
      res.status(201).redirect("/admin/products"); // 201 Created
    })
    .catch((err) => {
      console.log("In controller catch");
      console.error(err);
      res.status(500).redirect("/500"); // 500 Internal Server Error
    });
};

// READ all products
exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.status(200).render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        extraCss: ["/css/product.css"],
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.error(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// EDIT product page
exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) return res.status(404).redirect("/admin/products"); // 404 Not Found
      res.status(200).render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        extraCss: ["/css/forms.css"],
        editing: true,
        product,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.error(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// UPDATE product
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const { title, price, description } = req.body;
  const image = req.file;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.status(404).redirect("/admin/products"); // 404 Not Found
      }
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.status(403).redirect("/"); // 403 Forbidden
      }
      if (image) {
        product.imageUrl = image.path;
      }
      product.title = title;
      product.price = price;
      product.imageUrl = image.path;
      product.description = description;

      return product.save().then(() => {
        console.log("Updated Successfully!");
        res.status(200).redirect("/admin/products");
      });
    })
    .catch((err) => {
      console.error(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// DELETE product
exports.postDeleteProduct = (req, res, next) => {
  Product.deleteOne({ _id: req.body.productId, userId: req.user._id })
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).redirect("/admin/products"); // 404 if nothing deleted
      }
      res.status(200).redirect("/admin/products");
    })
    .catch((err) => {
      console.error(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
