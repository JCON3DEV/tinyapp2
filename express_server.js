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
    password: "123"
  },
};

app.set('view engine', 'ejs');
app.use(cookieParser());


// ===================  Below is page structure =====================
// changing from current to Most specific --> least specific




//Edit function // below is not strictly necessary;
app.get('/urls/:shortURL/edit', (req,res) =>{
  res.redirect(`/urls/${req.params.shortURL}`);  
});

app.post(`/urls/:shortURL/edit`, (req, res) => {
  const shortId = req.params.shortURL;
  const newLongId = req.body.longURL;
  urlDatabase[shortId] = newLongId;
  console.log(urlDatabase);
  res.redirect('/urls');
});



//Adding a new get route to allow a form submission
app.get("/urls/new", (req, res) => {
  // Step 1 - check th user obj
  // if (req.cookies[user_id]) {

  // }
  // // Step 2 
  // else {
  //   res.redirect('')
  // }
  // Step 3 - if cookie, pack the user info into a userObj & render usls_new with the obj
  let user_id = req.cookies["user_id"];
  let user = usersDatabase[user_id];
  let templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

//Delte method
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
}); 

//This is the edit page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let user_id = req.cookies["user_id"];
  let user = usersDatabase[user_id];
  const templateVars = {
    user,
    longURL: urlDatabase[shortURL], 
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
  let user_id = req.cookies["user_id"];
  let user = usersDatabase[user_id];
  // eventually add conditional statement for truthy / falsy of user

  const templateVars = {
    user,
    urls: urlDatabase, // Be aware of this. only this object should have urls: as urlDatabase.
  };
  res.render("urls_index", templateVars);
});

// Below accepts the form from /urls/new
// makes the new widget
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
  const templateVars = {
    user: undefined,
  };
  res.render('register', templateVars);
})

// const usersDatabase = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "123"
//   },
// };

// registration data recieved from user
app.post("/register", (req, res) => {
  const idNum = generateRandomString(6,arr);
  const userObject = {
    id: idNum,
    email: req.body.email,
    password: req.body.password,
  };
  console.log("userObject; ", userObject);
  console.log("database ", usersDatabase);
  // below should check the new input vs the existing database
  for (let user_id in usersDatabase) {
    // console.log("~~~ ########", user_id, userObject.email,usersDatabase[user_id].email);
    if (userObject.email === usersDatabase[user_id].email) {
      res.status(400)
        .send("Email already registered");
        // 400s if browsers or users fault roughly
        // 500s server fault
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
  console.log("this is the object; ", usersDatabase[idNum]);
  console.log(usersDatabase);
  res.cookie('user_id', idNum);
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
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// login user method
// ### new a Get login /###/  Curently broken
//#############################################
// Change this cookie to the global user object
app.post("/login", (req, res) =>{
  console.log("this is req.body; ", req.body);
  const userObject = {
    id: req.body.user_id,
    email: req.body.email,
    password: req.body.password,
  };
  let found = false;
  //search the database for a matching email;
  for (let users in usersDatabase) {
    if (userObject.email === usersDatabase[users].email && userObject.password !== usersDatabase[users].password){
      res.status(403)
        .send("Password Incorrect");
      return;
    }
    // below compares the login password with the password on record for that email
    if (req.body.email === usersDatabase[users].email && userObject.password === usersDatabase[users].password) {
      console.log("Existing user");
      found = true;
      //Need to set the cookie for that user // 
      userObject.id = usersDatabase[users].id;
      res.cookie("user_id", usersDatabase[users].id )
      let objVar = {
        user: usersDatabase[users],
        urls: urlDatabase
      };
      res.render("urls_index", objVar);
    }
    
  }
  
  for (let user_id in usersDatabase) {
    if (found === false && userObject.email !== usersDatabase[user_id].email) {
      res.status(403)
        .send("User Not Found");
      return;
    }
    // #################
    // Change logic to give error if password not matching
    // ################# Note that trying to login without account created does NOT yet have an error message 
    // if (found === false && userObject.password !== usersDatabase[user_id].password) {
    //   res.status(403)
    //     .send("Password incorrect");
    //   return;
    // }
  };
  
  console.log("userObject; ", userObject);
  console.log("database: ", usersDatabase);
  console.log("req.body.user_id: ", req.body.user_id);

  // res.cookie("user_id", req.body.user_id) //not sure on this yet
  
  // Check if  exists in database / might have to remove
  // const emailTestCase = Object.keys(usersDatabase);
  // for (const user in emailTestCase) {
  //   if (usersDatabase[user].email === userObject.email) { // removed req.body.user_id
  //     userObject = usersDatabase[user];
  //   }
  //   console.log(usersDatabase[user]);
  // }
  
  // let actualUser = {
  //   //userObject,
  //   urls: urlDatabase,
  //   email: req.body.email
  // };
  console.log(req.body.user_id);
  // No render in POST ## to edit
  // res.cookie('user_id',req.body.user_id);
  // res.render("urls_index", userObject);
});



app.get("/", (req, res) => {
res.send("Bonjour!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
