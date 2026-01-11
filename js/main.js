// Main JS for Okul static scaffold
document.addEventListener('DOMContentLoaded', function () {
  console.log('Okul initialized — static scaffold (client)');

  // Logout button will call server /logout to end session
  const logoutBtn = document.getElementById('logoutBtn');
  const userArea = document.getElementById('user-area');
  const userGreeting = document.getElementById('user-greeting');

  // On load, fetch current user from server
  fetch('/session', {credentials: 'same-origin'}).then(r => r.json()).then(data => {
    if(data && data.user){
      userGreeting.textContent = 'Привет, ' + data.user;
      userArea.style.display = '';
    } else {
      userArea.style.display = 'none';
    }
  }).catch(()=>{
    userArea.style.display = 'none';
  });

  if(logoutBtn){
    logoutBtn.addEventListener('click', function (){
      fetch('/logout', {method:'POST', credentials:'same-origin'}).then(()=>{
        // redirect to login page
        window.location.href = '/login';
      });
    });
  }
});