const mongodb = require("mongodb");

const path = require("path");

const http = require("http");

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const expressHbs = require("express-handlebars");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const errorController = require("./controllers/error");
const MONGODBURI = process.env.MONGODB_URI;
const User = require("./models/user");

const ObjectId = mongodb.ObjectId;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, true);
  }
};
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const app = express();
const store = new MongoDBStore({
  uri: MONGODBURI,
  collection: "sessions",
});
const csrfProtection = csrf();
const Handlebars = require("handlebars");

const rootDir = require("./utils/path");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.errorEmail = req.flash("error-email");
  res.locals.errorPassword = req.flash("error-password");
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use("/shop", shopRoutes);
app.use(authRoutes);

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
app.use((error, req, res, next) => {
  console.log(req, ".......req 401");
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});
app.get("/500", errorController.get500);
app.use(errorController.get404);

mongoose
  .connect(MONGODBURI)
  .then((result) => {
    console.log("connected");
    User.findOne()
      .then((user) => {
        if (!user) {
          const user = new User({
            name: "Max",
            email: "max@test.com",
            cart: {
              items: [],
            },
          });
          // user.save();
        }
      })
      .catch((err) => console.log(err));

    app.listen(3000);
  })
  .catch((err) => console.log(err));

const server = http.createServer(app);
