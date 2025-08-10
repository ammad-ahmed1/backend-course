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
  req.user
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
    })
    // Product.create({
    //   title: title,
    //   price: price,
    //   imageUrl: imageUrl,
    //   description: description,
    //   userId: userId,
    // })
    .then((result) => {
      console.log(result);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getEditProduct = (req, res, next) => {
  //get product page
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  //this will get the product of this user
  req.user
    .getProducts({ where: { id: prodId } })
    .then((products) => {
      const product = products[0];
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
    })
    .catch((err) => console.log(err));

  // this query will find by id but
  // Product.findByPk(prodId)
  //   .then((product) => {
  //     if (!product) {
  //       return res.redirect("/");
  //     }
  //     res.render("admin/edit-product", {
  //       pageTitle: "Edit Product",
  //       path: "/admin/edit-product",
  //       extraCss: ["/css/forms.css"],
  //       editing: editMode,
  //       product: product,
  //     });
  //   })
  //   .catch((err) => console.log(err));

  // Product.findById(prodId, (product) => {
  //   if (!product) {
  //     return res.redirect("/");
  //   }
  //   res.render("admin/edit-product", {
  //     pageTitle: "Edit Product",
  //     path: "/admin/edit-product",
  //     extraCss: ["/css/forms.css"],
  //     editing: editMode,
  //     product: product,
  //   });
  // });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedImageUrl = req.body.imageUrl;

  console.log("Raw req.body:", req.body);
  console.log("productId type:", typeof req.body.productId);
  console.log("productId value:", req.body.productId);

  Product.findByPk(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;
      return product.save();
    })
    .then((result) => {
      console.log("Updated product!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  //   products.push({ title: req?.body?.title });
  req.user
    .getProducts()
    // Product.findAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        extraCss: ["/css/product.css"],
      });
    })
    .catch((err) => {
      console.log(err);
    });
  // Product.fetchAll((products) => {
  //   res.render("admin/products", {
  //     prods: products,
  //     pageTitle: "Admin Products",
  //     path: "/admin/products",
  //     extraCss: ["/css/product.css"],
  //   });
  // });
};

exports.postDeleteProduct = (req, res, next) => {
  // Product.deleteById(req.body.productId);
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log("DESTROYED SUCCESSFULLY!");
      // res.redirect("/admin/products");
    })
    .then((err) => {
      console.log(err);
    });
  res.redirect("/");
};
