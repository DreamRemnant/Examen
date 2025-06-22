const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const db = require('./database');
const app = express();
const port = 3000;
const bcrypt = require('bcryptjs');
const session = require('express-session');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
  secret: 'randomstring',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));
// email_prefix transporter (using Postfix)
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail',
  tls: {
    rejectUnauthorized: false
  }
});

// Auth middleware
const checkAuth = (req, res, next) => {
  if (req.session && req.session.user) return next();
  res.redirect('/login.html');
};

// Routes
app.post('/register', (req, res) => {
  const { full_name, email_prefix, password } = req.body;
  console.log('Registration attempt:', { full_name, email_prefix, password });
  if (!full_name || !email_prefix || !password) {
    console.log('Validation failed:', req.body);
    return res.status(400).send('All fields are required');
  }

  db.createUser(full_name, email_prefix, password, (err) => {
    if (err) {
      console.error('Registration error:', err);
      return res.status(400).send('Registration failed');
    } 
    res.redirect('/login.html');
  });
});

app.post('/login', (req, res) => {
  const { email_prefix, password } = req.body;
  console.log('Login attempt:', { email_prefix, password });
  db.getUserByEmailPrefix(email_prefix, (err, user) => {
    if (err || !user) {
      console.error('User not found:', email_prefix, err);
      return res.status(401).send('Invalid credentials');
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send('Invalid credentials');
    }
    req.session.user = {
      id: user.id,
      email_prefix: user.email_prefix,
      full_name: user.full_name
    };
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
  const fromEmail = `${req.session.user.email_prefix}@dreamtcg.com`;
  const { recipients, subject, body } = req.body;
  const mailOptions = {
    from: `"${req.session.user.full_name}" <${fromEmail}>`,
    to: recipients,
    subject,
    text: body
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) return res.status(500).send('Error sending email_prefix');
    res.send('email_prefix sent successfully');
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});