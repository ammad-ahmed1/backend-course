// controllers/admin.js
const Product = require("../models/product");

// CREATE page
exports.getAddProduct = (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    extraCss: ["/css/forms.css"],
    editing: false,
    product: {},
    isAuthenticated: req.session.isLoggedIn,
  });
};

// CREATE handler
exports.postAddProduct = (req, res, nex) => {
  const { title, imageUrl, price, description } = req.body;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};

// READ all products
exports.getProducts = (req, res) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        extraCss: ["/css/product.css"],
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// EDIT product page
exports.getEditProduct = (req, res) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) return res.redirect("/admin/products");
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        extraCss: ["/css/forms.css"],
        editing: true,
        product,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

// UPDATE product
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      return product.save().then((result) => {
        console.log("Updated Succefully!");
        res.redirect("/admin/products");
      });
    })

    .catch((err) => console.log(err));
};

// DELETE product
exports.postDeleteProduct = (req, res) => {
  Product.deleteOne({ _id: req.body.productId, userId: req.user._id })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
