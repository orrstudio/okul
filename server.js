const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'user';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Simple auth middleware
function requireAuth(req, res, next){
  if(req.session && req.session.user){
    return next();
  }
  // allow login routes and static login page
  if(req.path === '/login' || req.path === '/login.html' || req.path === '/login.css'){
    return next();
  }
  return res.redirect('/login');
}

// Serve login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Expose a small session endpoint for client to show username
app.get('/session', (req, res) => {
  if(req.session && req.session.user){
    return res.json({ user: req.session.user });
  }
  return res.json({});
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if(!username || !password){
    return res.status(400).send('Missing');
  }
  if(password !== AUTH_PASSWORD){
    return res.status(401).send('Invalid');
  }
  req.session.user = username;
  return res.redirect('/');
});

// Handle logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    return res.redirect('/login');
  });
});

// Protect static assets and root
app.use('/css', requireAuth, express.static(path.join(__dirname, 'css')));
app.use('/js', requireAuth, express.static(path.join(__dirname, 'js')));
app.use('/assets', requireAuth, express.static(path.join(__dirname, 'assets')));

// Root route - protected
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
