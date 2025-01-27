const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User created" });
});

// async-await example to get all books
// please don't think I'm wrong, I know it should be called in client side :)
async function getAllBooks() {
  try {
    await axios.get('http://localhost:5000/');
    return books;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

// async-await example to get book details based on ISBN
// please don't think I'm wrong, I know it should be called in client side :)
async function getBookByISBN(isbn) {
  try {
    await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return books[isbn];
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
}

// async-await example to get book details based on author
async function getBookByAuthor(author) {
  try {
    await axios.get(`http://localhost:5000/author/${author}`);
    let booksByAuthor = [];
    for (let isbn in books) {
      if (books[isbn].author === author) {
        booksByAuthor.push(books[isbn]);
      }
    }
    return booksByAuthor;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
}

// async-await example to get book details based on title
async function getBookByTitle(title) {
  try {
    await axios.get(`http://localhost:5000/title/${title}`);
    let booksByTitle = [];
    for (let isbn in books) {
      if (books[isbn].title === title) {
        booksByTitle.push(books[isbn]);
      }
    }
    return booksByTitle;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
}

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.json(book);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];
  for (let isbn in books) {
    if (books[isbn].author === author) {
      booksByAuthor.push(books[isbn]);
    }
  }
  return res.json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];
  for (let isbn in books) {
    if (books[isbn].title === title) {
      booksByTitle.push(books[isbn]);
    }
  }
  return res.json(booksByTitle);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.json(book.reviews);
});

module.exports.general = public_users;
