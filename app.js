const mongodb = require("mongodb");

const path = require("path");

const http = require("http");

const express = require("express");
const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars");

const errorController = require("./controllers/error");
const { mongoConnect } = require("./utils/database");
const User = require("./models/user");

const ObjectId = mongodb.ObjectId;

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const db = require("./utils/database");

const app = express();

const Handlebars = require("handlebars");

const rootDir = require("./utils/path");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("689b6b301feef28a649d41c2")
    .then((user) => {
      req.user = user;
      req.user = new User(user?.name, user?.email, user?.cart, user?._id);
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

mongoConnect((client) => {
  app.listen(3000);
});

const server = http.createServer(app);
