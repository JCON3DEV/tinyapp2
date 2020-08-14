// generates a random string of alphabet charaters based on the length provided
function generateRandomString(length) {
  const arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  let ans = "";
  for (let i = length; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
};

// reurns the object key when an email is provided that is held within the given database
function getUserByEmail(email, database) {
  const itterableDatabase = Object.values(database);
  for (let user of itterableDatabase) {
    if (user.email === email) {
      return user;
    }
  }
};

// checks wether the given id is found within the database and returns the object associated with it
function urlsForUser(id, database) {
  let myUrls = {};
  for (let urlObjKey in database) {
    let userId = database[urlObjKey].userID;
    if (userId === id) {
      myUrls[urlObjKey] = database[urlObjKey];
    }
  }
  return myUrls;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
}