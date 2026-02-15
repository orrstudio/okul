const themeToggle = document.getElementById('themeToggle');
const contentDiv = document.getElementById('content');

function setTheme(dark) {
  if (dark) {
    document.body.classList.remove('light');
    if (themeToggle) {
      themeToggle.querySelector('.icon').textContent = '🌙';
    }
  } else {
    document.body.classList.add('light');
    if (themeToggle) {
      themeToggle.querySelector('.icon').textContent = '☀️';
    }
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    setTheme(false);
  } else {
    setTheme(true);
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('light');
    setTheme(!isDark);
  });
}

if (contentDiv) {
  fetch('/content')
    .then(r => {
      if (!r.ok) throw new Error('Not authorized');
      return r.json();
    })
    .then(data => {
      contentDiv.innerHTML = data.content;
    })
    .catch(err => {
      contentDiv.innerHTML = '<p>Xəta baş verdi</p>';
    });
}

initTheme();
