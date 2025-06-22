const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const db = require('./database');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Email transporter (using Postfix)
const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
});

// Auth middleware
const checkAuth = (req, res, next) => {
  if (req.session && req.session.user) return next();
  res.redirect('/login.html');
};

// Routes
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  db.createUser(username, email, password, (err) => {
    if (err) return res.status(400).send('Registration failed');
    res.redirect('/login.html');
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.getUserByUsername(username, (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid credentials');
    }
    req.session.user = user;
    res.redirect('/users.html');
  });
});

app.get('/users', checkAuth, (req, res) => {
  db.getAllUsers((err, users) => {
    if (err) return res.status(500).send('Database error');
    res.json(users);
  });
});

app.post('/send-mail', checkAuth, (req, res) => {
  const { recipients, subject, body } = req.body;
  const mailOptions = {
    from: req.session.user.email,
    to: recipients,
    subject,
    text: body
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) return res.status(500).send('Error sending email');
    res.send('Email sent successfully');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});