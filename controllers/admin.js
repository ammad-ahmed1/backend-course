const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  //get product page
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    extraCss: ["/css/forms.css"],
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  //   products.push({ title: req?.body?.title });
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(null, title, imageUrl, description, price);
  product.save();
  res.redirect("/admin/products");
};
exports.getEditProduct = (req, res, next) => {
  //get product page
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;

  Product.findById(prodId, (product) => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      extraCss: ["/css/forms.css"],
      editing: editMode,
      product: product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedImageUrl = req.body.imageUrl;
  const updatedProduct = new Product(
    prodId,
    updatedTitle,
    updatedImageUrl,
    updatedDesc,
    updatedPrice
  );
  updatedProduct?.save();
  res.redirect("/admin/products");
};

exports.getProducts = (req, res, next) => {
  //   products.push({ title: req?.body?.title });
  Product.fetchAll((products) => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      extraCss: ["/css/product.css"],
    });
  });
};

exports.postDeleteProduct = (req, res, next) => {
  console.log("Delete me: ", req.body);
  Product.deleteById(req.body.productId);
  res.redirect("/");
};
