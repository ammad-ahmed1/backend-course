const mongodb = require("mongodb");
const getDb = require("../utils/database").getDb;
const ObjectId = mongodb.ObjectId;

class Product {
  constructor(title, price, description, imageUrl, _id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = _id ? new mongodb.ObjectId(_id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    if (this._id) {
      // Update
      return db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      // Create
      return db.collection("products").insertOne(this);
    }
  }

  static fetchAll() {
    const db = getDb();
    return db.collection("products").find().toArray();
  }

  static findById(prodId) {
    const db = getDb();
    return db.collection("products").findOne({ _id: new ObjectId(prodId) });
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(prodId) });
  }
}

module.exports = Product;
