const http = require("http");
const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars");

const express = require("express");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");

const db = require("./utils/database");

const path = require("path");

const app = express();

const Handlebars = require("handlebars");

const rootDir = require("./utils/path");
const sequelize = require("./utils/database");

const Product = require("./models/product");
const User = require("./models/user");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use("/shop", shopRoutes);
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

app.engine(
  "hbs",
  expressHbs({
    layoutsDir: "views/layouts",
    // partialsDir: path.join(__dirname, "views", "includes"),
    defaultLayout: "main-layout",
    extname: "hbs",
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    partialsDir: ["views/partials", "views/includes"],
    helpers: {
      ifEquals: function (arg1, arg2, options) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      },
      multiply: (a, b) => (parseFloat(a) * parseFloat(b)).toFixed(2),
    },
  })
); //this function will initialize handlebars and named as hbs
//set views and view engine
// app.set("view engine", "pug"); //if want to use pug

app.set("view engine", "hbs"); //if want to use handlebars
app.set("views", "views");

// Custom helper for active link

app.use(errorController.get404);

Product.belongsTo(User, { constrains: true, onDelete: "CASCADE" });
User.hasMany(Product);

sequelize
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ username: "Max", email: "test@test.com" });
    }
    return user;
  })
  .then((user) => {
    // console.log(user);
    server.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });

const server = http.createServer(app);
