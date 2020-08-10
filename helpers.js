// const arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
function generateRandomString(length, arr) {
  let ans = "";
  for (let i = length; i > 0; i--) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
};

function getUserByEmail(email, database) {
  const keys = Object.keys(database);
  for (let key of keys) {
    const user = database[key];
    if (user.email === email) {
      return user;
    }
    return undefined;
  }
};

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