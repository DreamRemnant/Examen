const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database');

    db.run(`PRAGMA journal_mode = WAL;`, (err) => {
      if (err)  console.error('Pragma error:', err);
    })
  }
});

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      email_prefix TEXT UNIQUE,
      password TEXT
    )
  `);
});

// User operations
const createUser = (full_name, email_prefix, password, callback) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  try {
    db.run(
      'INSERT INTO users (full_name, email_prefix, password) VALUES (?, ?, ?)',
      [full_name, email_prefix, hash],
      function(err) {
        if (err){
          if (err.message.includes('UNIQUE constraint failed')) {
            console.log('Duplicate email prefix:', email_prefix);
            return callback('Email prefix already exists');
          }
          console.error('Database INSERT error:', err.message);
          return callback(err.message);
        }
        callback(null, this.lastID);
      }
    );
  } catch (err) {
  console.error('Hashing error:', err);
  callback(err.message);
  }
};

const getUserByfull_name = (full_name, callback) => {
  db.get('SELECT * FROM users WHERE full_name = ?', [full_name], callback);
};

const getAllUsers = (callback) => {
  db.all('SELECT id, full_name, email_prefix FROM users', callback);
};

const getUserByEmailPrefix = (email_prefix, callback) => {
  db.get('SELECT * FROM users WHERE email_prefix = ?', [email_prefix], callback);
};

module.exports = { createUser, getUserByfull_name, getAllUsers, getUserByEmailPrefix };