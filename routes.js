const fs = require("fs");

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>Send a Message</title></head>");
    res.write("<body>");
    res.write("<h1>Enter Your Message</h1>");
    res.write("<form action='/message' method='POST'>");
    res.write(
      "<input type='text' name='message' placeholder='Enter your message' required>"
    );
    res.write("<button type='submit'>Send</button>");
    res.write("</form>");
    res.write("</body>");
    res.write("</html>");
    return res.end();
  }
  if (url === "/message" && method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      console.log(chunk);
      body.push(chunk);
    });
    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split("=")[1];
      fs.writeFile("message.txt", message, (err) => {
        res.statusCode = 302;
        // res.setHeader("Location", "/");
        return res.end();
      });
    });
  }
  console.log("Server is running!");
  res.setHeader("Content-Type", "text/html");
  res.write("<!DOCTYPE html>");
  res.write('<html lang="en">');
  res.write("<head><title>My First Page</title></head>");
  res.write("<body><h1>Hello, World!</h1>");
  res.write("<p>This is my first HTML page!</p>");
  res.write("</body></html>");
  res.end();
};
module.exports = requestHandler;
