const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  //get product page
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    extraCss: ["/css/forms.css"],
  });
};

exports.postAddProduct = (req, res, next) => {
  //   products.push({ title: req?.body?.title });
  console.log(req, "...reqreqreq");
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, imageUrl, price, description);
  product.save();
  res.redirect("/admin/products");
};

exports.getProducts = (req, res, next) => {
  //   products.push({ title: req?.body?.title });
  Product.fetchAll((products) => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  });
};
