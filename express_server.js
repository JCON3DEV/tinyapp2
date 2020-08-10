const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSesssion = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString } = require('./helpers');
const { getUserByEmail } = require('./helpers');
const { urlsForUser } = require('./helpers');
const salt = bcrypt.genSaltSync(10);
const app = express();
const PORT = 8080;
const arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

// ======================  Middleware setup  ================================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSesssion({
  name: 'session',
  keys: ['my-secret-dont-tell']
}));
app.set('view engine', 'ejs');

// ======================= Test Databases ===================
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID:"aJ48lW"
  },
  "s9m5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  },
  "hj65j8": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};

const usersDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
};

// ===================  Page structure =====================

//Delte method
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    res.redirect("/urls");
    return;
  }
  const id = req.session["user_id"];
  if (url.userID !== id) {
    console.log("invalid user trying to delete");
    // poss give error mesage instead
    res.redirect("/urls");
    return;
  }
  
  delete urlDatabase[shortURL];
  res.redirect('/urls/');
});

//Edit function 
app.get('/urls/:shortURL/edit', (req,res) =>{
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post(`/urls/:shortURL/edit`, (req, res) => {
  const shortId = req.params.shortURL;
  const newLongId = req.body.longURL;
  
  if (req.session["user_id"] !== req.params.shortURL) {
    res.redirect("/urls");
    return;
  }
  urlDatabase[shortId]["longURL"] = newLongId;
  res.redirect('/urls');
});



//Adding a new get route to allow a form submission
app.get("/urls/new", (req, res) => {
  let user_id = /*req.cookies*/req.session["user_id"];
  let user = usersDatabase[user_id];
  if (!user_id || user_id !== user.id) {
    res.redirect("/login");
    return;
  }

  let templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const id = req.params.shortURL;
  //below redirects to whichever website is associated with the short URL
  res.redirect(urlDatabase[id]["longURL"]);
});

//This is the edit page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let user_id = /*req.cookies*/req.session["user_id"];
  let user = usersDatabase[user_id];
  const templateVars = {
    user,
    longURL: urlDatabase[shortURL]["longURL"],
    shortURL
  };
  res.render("urls_show", templateVars);
});


// visualisation of the database // security issue
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/users.JSON", (req, res) => {
  res.json(usersDatabase);
});

app.get("/urls", (req, res) => {
  let user_id = /*req.cookies*/req.session["user_id"];
  let user = usersDatabase[user_id];
  // // Below blocks access if the user is not logged in;
  if (!user) {
    res.redirect("/login");
    return;
  }
  const tempUrlsForUser = urlsForUser(user_id, urlDatabase);
  // console.log("tempURLS", tempUrlsForUser);
  // ###########################
  const templateVars = {
    user,
    urls: tempUrlsForUser, // possibly add ["longURL"] // Be aware of this. only this object should have urls: as urlDatabase.
  };
  // console.log("get / urls templateVars", templateVars);
  res.render("urls_index", templateVars);
});

// Below accepts the form from /urls/new
// makes the new widget
app.post("/urls", (req, res) => {
  // console.log(req.body.longURL);  // Log the POST request body to the console
  const newShortURL = generateRandomString(6, arr);
  // const longURL = urlDatabase[shortURL];
  // beleive this need to be the id
  urlDatabase[newShortURL] = {
    longURL : req.body.longURL,
    userID: /*req.cookies*/req.session["user_id"],
  };
  // Below redirects the user to their new short URL address
  res.redirect(`/urls/${newShortURL}`);
});


// registration page
app.get("/register", (req, res) =>{
  const templateVars = {
    user: undefined,
  };
  res.render('register', templateVars);
});

// registration data recieved from user
app.post("/register", (req, res) => {
  const idNum = generateRandomString(6,arr);
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password,salt);
  const userObject = {
    id: idNum,
    email: req.body.email,
    password: hashedPassword,
  };
  // below checks the new input vs the existing database
  for (let user_id in usersDatabase) {
    if (userObject.email === usersDatabase[user_id].email) {
      res.status(400)
        .send("Email already registered");
      return;
    }
  }
  // Below checks if the email and password fields are aemopty and returns a 404 if true
  if (userObject.email === "" || userObject.password === "") {
    res.status(400)
      .send("Page Not Found");
    return;
  }

  usersDatabase[idNum] = userObject;
  req.session.user_id = idNum;
  // res.cookie('user_id', idNum);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let objVar = {
    //not sure if this is correct;
    user: undefined
  };
  res.render("login", objVar);
});

// logout method // NO logout Get
app.post("/logout", (req, res) => {
  req.session = null;
  // res.clearCookie("user_id"); // delete after cookies are encoded
  res.redirect("/urls");
});

// login user method
app.post("/login", (req, res) =>{
  //1. Receive the values
  const email = req.body.email;
  const password =  req.body.password;
  let user = getUserByEmail(email, usersDatabase);
  // console.log("user  && ", user);
  // console.log("usersDatabase[user]", usersDatabase);
  bcrypt.compareSync(password, user["password"]);/*  Stored password in user DB */
  // console.log("verdict ", verdict);


  //2. Below checks if the login details are empty, responds w/ error msg
  if (!email || !password) {
    res.status(400)
      .send("Please enter details");
  } else {
    // function compares email input by user to the database collection
    const user = getUserByEmail(email, usersDatabase);
    // Below checks the presence of a user account & whether pwd is correct
    if (!user || !bcrypt.compareSync(password, user["password"])) {
      res.status(403)
        .send("invalid username or password");
    } else {
      // if username an pwd are correct;
      req.session.user_id = user.id;
      // res.cookie("user_id", user.id); // old code to be deleted after encoded cookies
      res.redirect("/urls");
    }
  }
});



app.get("/", (req, res) => {
  res.send("Bonjour!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
