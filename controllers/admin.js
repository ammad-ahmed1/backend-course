// controllers/admin.js
const Product = require("../models/product");

// CREATE page
exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    extraCss: ["/css/forms.css"],
    editing: false,
    product: {},
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
  Product.find()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        extraCss: ["/css/product.css"],
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
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      return product.save();
    })
    .then((result) => {
      console.log("Updated Succefully!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

// DELETE product
exports.postDeleteProduct = (req, res) => {
  Product.findByIdAndDelete(req.body.productId)
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};
