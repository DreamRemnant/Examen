const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./users.db');

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
});

// User operations
const createUser = (username, email, password, callback) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  
  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hash],
    function(err) {
      callback(err, this.lastID);
    }
  );
};

const getUserByUsername = (username, callback) => {
  db.get('SELECT * FROM users WHERE username = ?', [username], callback);
};

const getAllUsers = (callback) => {
  db.all('SELECT id, username, email FROM users', callback);
};

module.exports = { createUser, getUserByUsername, getAllUsers };