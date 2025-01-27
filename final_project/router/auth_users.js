const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  if (username.length < 1 || typeof username !== 'string') {
    return false;
  }
  return true;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  console.log(users);
  for (let user of users) {
    if (user.username === username && user.password === password) {
      return true
    }
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: 60 });

    // Store access token and username in session
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).json({ message: "Login successful", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  const username = req.session.authorization.username;
  const review = req.body.review;
  if (!review) {
    return res.status(400).json({ message: "Review required" });
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review added" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  const username = req.session.authorization.username;
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
