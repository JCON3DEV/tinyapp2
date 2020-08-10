const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
let salt = bcrypt.genSaltSync(10);
var cookieSesssion = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080

const arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function generateRandomString(length, arr) {
  let ans = "";
  for (let i = length; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)]; 
  }
  return ans;
}

// ======================  Middleware setup  ================================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSesssion({
  name: 'session',
  keys: ['my-secret-dont-tell']
}));
app.set('view engine', 'ejs');

// ======================= set up for modules ===================
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

function getUserByEmail(email, usersDatabase) {
  const keys = Object.keys(usersDatabase);
  for (let key of keys){
    const user = usersDatabase[key];
    if (user.email === email) {
      return user;
    }
  }
};
function urlsForUser(id) {
  let myUrls = {};
  for (let urlObjKey in urlDatabase){
    let userId = urlDatabase[urlObjKey].userID;
    if (userId === id) {
      myUrls[urlObjKey] = urlDatabase[urlObjKey];
    }
  }
  return myUrls;
};
// function urlsForUser(id) {
//   const keys = Object.keys(usersDatabase);
//   for (let key of keys) {
//     if (id === usersDatabase[key].id) {
//       return usersDatabase[key];
//     }
//   }
  // loop through the urlDatabase,
  // get the user id match instance of, if matches, store the , 
  // retunr the object in the same structure that the URLDatabse was written
  // consoloe.log this function to match the structure and purpose it is intended for.
// };


// ===================  Below is page structure =====================
// changing from current to Most specific --> least specific


//Edit function // below is not strictly necessary;
app.get('/urls/:shortURL/edit', (req,res) =>{
  // conditional statement check the cookie
  // if id !== id redirect
  res.redirect(`/urls/${req.params.shortURL}`);  //dzphht
});

app.post(`/urls/:shortURL/edit`, (req, res) => {
  const shortId = req.params.shortURL;
  const newLongId = req.body.longURL;
  
  if (/*req.cookies*/req.session["user_id"] !== req.params.shortURL) {
    res.redirect("/urls");
    return;
  };
  urlDatabase[shortId]["longURL"] = newLongId;
  console.log(urlDatabase);
  res.redirect('/urls');
});



//Adding a new get route to allow a form submission
app.get("/urls/new", (req, res) => {
  let user_id = /*req.cookies*/req.session["user_id"];
  let user = usersDatabase[user_id];
  if (!user_id || user_id !== user.id) {
    res.redirect("/login");
    return;
  };

  let templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

//Delte method
app.post('/urls/:shortURL/delete', (req, res) => {
  // TURN this into a function perhaps boolena return take the redirect as param
  if (/*req.cookie*/req.session["user_id"] !== req.params.shortURL) {
    res.redirect("/urls");
    return;
  };
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
}); 

app.get("/u/:shortURL", (req, res) => {
  const id = req.params.shortURL;
  //below redirects to whichever website is associated with the short URL
  res.redirect(urlDatabase[id]["longURL"]);
})

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
//

app.get("/urls", (req, res) => {
  // // 1. user has not login
  // const templateVars = {
  //   user_id: null,
  //   urls: urlDatabase,
  //   email: null
  // }; 
  // // 2. user has login
  // const templateVars = {
  //   user_id: req.cookies["user_id"],
  //   urls: urlDatabase,
  //   email: usersDatabase[id].email
  // };
  // =======================TESTING Below ====================================
  // ## below just sets a cookie testing 
  // req.session.visitor = "guest";
  // res.cookie("visitor", "guest");
  // console.log("cookies; ", /*req.cookies*/req.session.visitor); // But this one is  "guest"
  // console.log("cookies; ", /*req.cookies*/req.session.user_id); // why is this undefined ??
  // probs should delete above visitor cookie
  // deleted guest cookie on line  248 // does not work as intended
  // =======================TESTING Above ====================================
  let user_id = /*req.cookies*/req.session["user_id"];
  let user = usersDatabase[user_id];
  // // Below blocks access if the user is not logged in;
  if (!user) {
      res.redirect("/login");
      return;
    }
    // eventually add conditional statement for truthy / falsy of user
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const tempUrlsForUser = urlsForUser(user_id);
  console.log("tempURLS", tempUrlsForUser);
  // ###########################
  const templateVars = {
    user,
    urls: tempUrlsForUser, // possibly add ["longURL"] // Be aware of this. only this object should have urls: as urlDatabase.
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

// Below accepts the form from /urls/new
// makes the new widget

// TESTING
app.post("/urls", (req, res) => {
  console.log(req.body.longURL);  // Log the POST request body to the console
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

// app.post("/urls", (req, res) => {
//   console.log(req.body.longURL);  // Log the POST request body to the console
//   const idString = generateRandomString(6, arr);
//   // const longURL = urlDatabase[shortURL];
//   console.log("urlDatabase[idString][\"longURL\"] is; ", urlDatabase[idString]["longURL"]);
//   // beleive this need to be the id
//   urlDatabase[idString]["longURL"] = req.body.longURL;
//   // Below redirects the user to their new short URL address
//   res.redirect(`/urls/${idString}`);
// });



// registration page
app.get("/register", (req, res) =>{
  const templateVars = {
    user: undefined,
  };
  res.render('register', templateVars);
})

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
  // below should check the new input vs the existing database
  for (let user_id in usersDatabase) {
    // console.log("~~~ ########", user_id, userObject.email,usersDatabase[user_id].email);
    if (userObject.email === usersDatabase[user_id].email) {
      res.status(400)
        .send("Email already registered");
      return;
    }
  };
  // JH Below checks if the email and password fields are aemopty and returns a 404 if true
  if (userObject.email === "" || userObject.password === "") {
    res.status(400)
      .send("Page Not Found");
    return;
  };

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
////////////////////////////////////////
// Delete below
// app.post("/loginrohit", (req, res) =>{
//   //1. Receive the values
//   const email = req.body.email;
//   const password =  req.body.password;

//   //2. if anyone of the values is empty send the response back
//   if (!email || !password) {
//     res.status(400).send("Please enter details");
//   } else{
//     //it means the email and password were not empty
//     //Check the email from the database
//     const user = getUserByEmail(email, usersDatabase);
//     //if the user name or password were not right
//     if (!user || user.password !== password) {
//       res.status(403).send("invalid username or password");
      
//     } else{
//       //if the username and password were right
//       res.cookie("user_id", user.id);
//       res.redirect("/urls"); 
//     }

//   }

 
  
// });
// //////////////////////////////////////////////////////


// login user method
app.post("/login", (req, res) =>{
  //1. Receive the values
  const email = req.body.email;
  const password =  req.body.password;
  let user = getUserByEmail(email, usersDatabase);
  console.log("user  && ", user);
  console.log("usersDatabase[user]", usersDatabase);
  const verdict = bcrypt.compareSync(password, user["password"] /*  Stored password in user DB */ );
  console.log("verdict ", verdict);


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
    }
    else {
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
