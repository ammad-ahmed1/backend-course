const http = require("http");
const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars");

const express = require("express");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");

const path = require("path");

const app = express();

const rootDir = require("./utils/path");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.engine(
  "hbs",
  expressHbs({
    layoutsDir: "views/layouts",
    defaultLayout: "main-layout",
    extname: "hbs",
    partialsDir: "views/partials",
    helpers: {
      ifEquals: function (arg1, arg2, options) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      },
    },
  })
); //this function will initialize handlebars and named as hbs
// app.set("view engine", "pug"); //if want to use pug
app.set("view engine", "hbs"); //if want to use handlebars
app.set("views", "views");

// Custom helper for active link

app.use(errorController.get404);

const server = http.createServer(app);

server.listen(3000);
