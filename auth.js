class AuthSystem {
  constructor(){ this.currentUser = JSON.parse(localStorage.getItem('currentUser'))||null; this.users = JSON.parse(localStorage.getItem('users'))||[]; }
  login(email,password){ const user=this.users.find(u=>u.email===email && u.password===password); if(user){ this.currentUser=user; localStorage.setItem('currentUser', JSON.stringify(user)); return true; } alert('Invalid email or password'); return false; }
  register(name,email,password,confirm){ if(password!==confirm){ alert('Passwords do not match'); return false; } if(this.users.some(u=>u.email===email)){ alert('Email already registered'); return false; } const newUser={name,email,password}; this.users.push(newUser); localStorage.setItem('users', JSON.stringify(this.users)); this.currentUser=newUser; localStorage.setItem('currentUser', JSON.stringify(newUser)); return true; }
  logout(){ this.currentUser=null; localStorage.removeItem('currentUser'); }
}

document.addEventListener('DOMContentLoaded',()=>{ window.authSystem = new AuthSystem(); });
