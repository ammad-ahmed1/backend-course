const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    `mongodb+srv://iammadmughal480:uEmigj2ZqOyjg01T@cluster0.qgsvy6q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
    .then((client) => {
      console.log("Connected!");
      // console.log(client);
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    console.log(_db);
    return _db;
  }
  throw "No db found!";
};

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;
// module.exports = mongoConnect;

module.exports = {
  mongoConnect,
  getDb,
};
