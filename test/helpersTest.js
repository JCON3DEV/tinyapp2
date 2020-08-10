const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    console.log("user;", user);
    const expectedOutput = "userRandomID";
    assert(user.id === expectedOutput, "The email is not inside the database");
  });
  it('should return undefined if we pass an email that is not in the database', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "madeup@gmail.com"; 
    assert(user.email !== expectedOutput, "email is not in the database");
  });
});
