const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { marked } = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_PASSWORD_USER = process.env.AUTH_PASSWORD_USER || 'okul';
const AUTH_PASSWORD_ADMIN = process.env.AUTH_PASSWORD_ADMIN || 'admin888';
const SESSION_SECRET = process.env.SESSION_SECRET || 'okul-secret-key';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  if (req.path === '/login' || req.path === '/login.html' || 
      req.path.startsWith('/css/') || req.path.startsWith('/js/') || 
      req.path.startsWith('/assets/')) {
    return next();
  }
  return res.redirect('/login');
}

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  console.log('Login attempt, password:', password);
  if (password === AUTH_PASSWORD_ADMIN) {
    req.session.authenticated = true;
    req.session.role = 'admin';
    return res.redirect('/');
  }
  if (password === AUTH_PASSWORD_USER) {
    req.session.authenticated = true;
    req.session.role = 'user';
    return res.redirect('/');
  }
  return res.redirect('/login?error=1');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/session', requireAuth, (req, res) => {
  res.json({ role: req.session.role || 'user' });
});

app.get('/content', requireAuth, (req, res) => {
  const mdPath = path.join(__dirname, 'ders.md');
  console.log('Loading from:', mdPath);
  fs.readFile(mdPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error loading markdown:', err);
      return res.status(500).json({ error: 'Markdown file not found' });
    }
    const html = marked(data);
    res.json({ content: html });
  });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`User: okul | Admin: admin888`);
});
