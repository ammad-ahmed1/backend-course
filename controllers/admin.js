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
exports.postAddProduct = (req, res) => {
  const { title, imageUrl, price, description } = req.body;
  const product = new Product(
    title,
    price,
    description,
    imageUrl,
    null,
    req.user._id
  );
  product
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};

// READ all products
exports.getProducts = (req, res) => {
  Product.fetchAll()
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
exports.postEditProduct = (req, res) => {
  const { productId, title, price, description, imageUrl } = req.body;
  const updatedProduct = new Product(
    title,
    price,
    description,
    imageUrl,
    productId
  );
  updatedProduct
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};

// DELETE product
exports.postDeleteProduct = (req, res) => {
  Product.deleteById(req.body.productId)
    .then(() => res.redirect("/admin/products"))
    .catch((err) => console.log(err));
};
