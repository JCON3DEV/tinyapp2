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


// ======================= set up for modules ===================
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};

app.set('view engine', 'ejs');
app.use(cookieParser());


// ===================  Below is page structure =====================
// changing from current to Most specific --> least specific




//Edit function
app.get('/urls/:shortURL/edit', (req,res) =>{
  // console.log(req.params.shortURL);
  
  res.redirect(`/urls/${req.params.shortURL}`);  
});
app.post(`/urls/:shortURL/edit`, (req, res) => {
  console.log(req.params.shortURL);//Gives the shortURL
  const shortId = req.params.shortURL;
  console.log(req.body.longURL); // Gives the longURL object
  const newLongId = req.body.longURL;
  console.log(urlDatabase);
  urlDatabase[shortId] = newLongId;
  res.redirect('/urls');
});



//Adding a new get route to allow a form submission
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    // ... how to send this to the headers ?? ... 
  };
  res.render("urls_new", templateVars);
});

//Delte method
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
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
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// Below accepts the form
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const idString = generateRandomString(6, arr);
  // const longURL = urlDatabase[shortURL];
  urlDatabase[idString] = req.body.longURL;
  // Below redirects the user to their new short URL address
  res.redirect(`/urls/${idString}`);
});

// registration page
app.get("/register", (req, res) =>{
  res.render('register', {username:null})
})
app.post("/register", (req, res) => {
  // usersDatabase[Id] = {
  //   // id: ndjndnjd,
  //   // email: fmfif@dmwidn,
  //   // password: password123
  // };
  console.log(req);
  const templateVars = {
    username: req.body.email
  };
  res.render("register", templateVars);
});


// logout method // NO logout Get
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})


//======================================= POST Routes ============
//route for Edit


// login user method
// ### new a Get login /###/
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
  res.redirect("/urls");
})



app.get("/", (req, res) => {
res.send("Bonjour!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
