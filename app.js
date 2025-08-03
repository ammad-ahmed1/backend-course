const http = require("http");
const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars");

const express = require("express");

const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const path = require("path");

const app = express();

const rootDir = require("./utils/path");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminData.routes);
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

app.use((req, res, next) => {
  // res.sendFile(path.join(rootDir, "views", "404.html"));
  res.status(404).render("404", { pageTitle: "Page Not Found" });
});

const server = http.createServer(app);

server.listen(3000);
