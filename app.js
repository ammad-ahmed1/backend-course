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

const rootDir = require("./utils/path");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use("/shop", shopRoutes);

app.engine(
  "hbs",
  expressHbs({
    layoutsDir: "views/layouts",
    // partialsDir: path.join(__dirname, "views", "includes"),
    defaultLayout: "main-layout",
    extname: "hbs",
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

const server = http.createServer(app);

server.listen(3000);
