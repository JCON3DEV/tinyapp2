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
//const generateRandomString = require('randomString.js'); 


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
  // Step 1 - check if they have a coookie?
  // if (req.cookies[username]) {

  // }
  // // Step 2 - if no cookie, kick them out
  // else {
  //   res.redirect('')
  // }
  // Step 3 - if cookie, pack the user info into a userObj & render usls_new with the obj

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
  const templateVars = { username: req.cookies["username"], email: null, longURL: urlDatabase[shortURL], shortURL };
  if (req.cookies["username"]) {
    templateVars.email = usersDatabase['userRandomID'].email;
  }
  // This hardcoding solution will cause problems later.
  res.render("urls_show", templateVars);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  // // 1. user has not login
  // const templateVars = {
  //   username: null,
  //   urls: urlDatabase,
  //   email: null
  // }; 
  // // 2. user has login
  // const templateVars = {
  //   username: req.cookies["username"],
  //   urls: urlDatabase,
  //   email: usersDatabase[id].email
  // };

  const userNotLogged = {
    username: req.cookies["username"],
    urls: urlDatabase,
    email: null
  };
  res.render("urls_index", userNotLogged);
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

// const usersDatabase = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
// };

// registration data recieved from user
app.post("/register", (req, res) => {
  if (req === ""){
    throw Error;
  }
  const idNum = generateRandomString(6,arr)
  const templateVars = {
    userId: idNum,
    username: req.body.email,
    password: req.body.password,
  };
  usersDatabase[idNum] = templateVars;
  console.log("this is the object; ", usersDatabase[idNum]);
  console.log(usersDatabase);
  res.cookie('user_id', idNum);
  res.render("urls_index", templateVars);
});


// logout method // NO logout Get
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// login user method
// ### new a Get login /###/
//#############################################
// Change this cookie to the global user object
app.post("/login", (req, res) =>{
  let userObject ={
  };
  console.log(req.body);
  
  // Check if username exists in database
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === req.body.username) {
      userObject = usersDatabase[user];
    }
    console.log(usersDatabase[user]);
  }
  
  let actualUser = {
    userObject,
    urls: urlDatabase,
    email: userObject.email
  };
  res.cookie('username',req.body.username);
  res.render("urls_index", actualUser);
})



app.get("/", (req, res) => {
res.send("Bonjour!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
