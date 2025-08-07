const fs = require("fs");
const path = require("path");
const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  static addProduct(id, productPrice) {
    //fetch the previous cart

    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      //analyze the cart => Find existing product
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      //add new product / increase quantity
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +productPrice;
      cart.products = [...cart.products];
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }
  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      }

      const cart = JSON.parse(fileContent);

      const existingProduct = cart.products.find((prod) => prod.id === id);

      if (!existingProduct) {
        return; // Product not in cart, nothing to do
      }

      const updatedProducts = cart.products.filter((prod) => prod.id !== id);
      const updatedTotalPrice =
        cart.totalPrice - productPrice * existingProduct.qty;

      const updatedCart = {
        products: updatedProducts,
        totalPrice: updatedTotalPrice,
      };

      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        if (err) {
          console.log("Error updating cart:", err);
        }
      });
    });
  }
  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        cb({ products: [], totalPrice: 0 });
      } else {
        cb(JSON.parse(fileContent));
      }
    });
  }
};
