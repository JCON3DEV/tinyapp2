const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const ejs = require("ejs"); // THis might be redundent

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.send("Bonjour!");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls : urlDatabase};
  res.render("urls_index", templateVars);
});
//Adding a new get route to allow a form submission
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//recently aded below;
// the shortURL in the string below refers top the key of urlDatabase
app.get("/urls/:shortURL", (req, res) => {
  // assigned a variable to the object key using; req.params.shortURL
  const shortURL = req.params.shortURL;
  // console.log(req.params); 
  //Above shows the short URL and its valu in the server terminal
  // longURL: is using trad notation to assign the vlaue of that key
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
})

// app.get("/urls/:shortURL", (req, res) => {
//   res.render("urls_show", templateVars.9sm5xK);
// })
// ends above;
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
