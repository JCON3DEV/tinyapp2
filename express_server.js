const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
function generateRandomString(length, arr) {
  let ans = "";
  for (let i = length; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)]; 
  }
  return ans;
  // alternativly below;
  // let ans = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
// something is broken with importing this. Need to fix
// const generateRandomString = require('randomString.js'); 

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
// Below accepts the form
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const idString = generateRandomString(6,arr);
  // const longURL = urlDatabase[shortURL];
  urlDatabase[idString] = req.body.longURL;
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${idString}`);
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
