const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};

app.set('view engine', 'ejs');
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Bonjour!");
});
///###########
// new link to registratin page hopefully
// app.get("/urls", (req, res) =>{
//   res.render("register")
// })
//#################
// login user method
app.post("/login", (req, res) =>{
  console.log(req.body.name);
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
    // ... how to send this to the headers ?? ... 
  };
  res.cookie('username',req.body.name);
  // Below was suggested by Travis G - not sure of purpose yet.
  // res.cookie('cookiename', 'cookievalue', { maxAge: 900000, httpOnly: true }); 
  res.render("register", templateVars);//changed this from "/urls"
})

// logout method
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

//Delte method
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
}); 

//Edit function
app.get('/urls/:shortURL/edit', (req,res) =>{
  // console.log(req.params.shortURL);
  
  res.redirect(`/urls/${req.params.shortURL}`);  
});
//route for Edit
app.post(`/urls/:shortURL/edit`, (req, res) => {
  console.log(req.params.shortURL);//Gives the shortURL
  const shortId = req.params.shortURL;
  console.log(req.body.longURL); // Gives the longURL object
  const newLongId = req.body.longURL;
  console.log(urlDatabase);
  urlDatabase[shortId]= newLongId;
  res.redirect('/urls');
})

// route for registration page
app.get("/register", (req, res) =>{
  res.render('register', {username:null})
})

app.post("/register", (req, res) => {
  res.render("register", templateVars);
})

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
    // ... how to send this to the headers ?? ... 
  };

  res.render("urls_index", templateVars);
});

//Adding a new get route to allow a form submission
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    // ... how to send this to the headers ?? ... 
  };
  res.render("urls_new", templateVars);
});

// Below accepts the form
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const idString = generateRandomString(6,arr);
  // const longURL = urlDatabase[shortURL];
  urlDatabase[idString] = req.body.longURL;
  // Below redirects the user to their new short URL address
  res.redirect(`/urls/${idString}`);
});


// the shortURL in the string below refers to the key of urlDatabase
app.get("/urls/:shortURL", (req, res) => {
  // assigned a variable to the object key using; req.params.shortURL
  const shortURL = req.params.shortURL;
  // console.log(req.params); 
  //Above shows the short URL and its valu in the server terminal
  // longURL: is using trad notation to assign the vlaue of that key
  const templateVars = { username: req.cookies["username"], longURL: urlDatabase[shortURL], shortURL };
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
