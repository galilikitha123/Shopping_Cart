// auth.js

class AuthSystem {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.initialized = false;
        this.setupAuthUI();
        this.updateAuthState();
    }

    setupAuthUI() {
        if (this.initialized) return;
        
        // Create auth modal
        const authModal = document.createElement('div');
        authModal.className = 'auth-modal';
        authModal.innerHTML = `
            <div class="auth-modal-content">
                <div class="auth-header">
                    <h2>Account</h2>
                    <button class="close-auth">×</button>
                </div>
                <div class="auth-forms">
                    <!-- Login Form -->
                    <form id="loginForm" class="auth-form active">
                        <h3>Login</h3>
                        <div class="form-group">
                            <input type="email" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="password" placeholder="Password" required>
                        </div>
                        <button type="submit" class="btn">Login</button>
                        <p class="switch-form">Don't have an account? <a href="#" data-form="registerForm">Register</a></p>
                    </form>

                    <!-- Register Form -->
                    <form id="registerForm" class="auth-form">
                        <h3>Register</h3>
                        <div class="form-group">
                            <input type="text" placeholder="Full Name" required>
                        </div>
                        <div class="form-group">
                            <input type="email" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="password" placeholder="Password" required>
                        </div>
                        <div class="form-group">
                            <input type="password" placeholder="Confirm Password" required>
                        </div>
                        <button type="submit" class="btn">Register</button>
                        <p class="switch-form">Already have an account? <a href="#" data-form="loginForm">Login</a></p>
                    </form>

                    <!-- Profile View -->
                    <div id="profileView" class="auth-form">
                        <h3>Profile</h3>
                        <div class="profile-info">
                            <p class="user-name"></p>
                            <p class="user-email"></p>
                        </div>
                        <button class="btn logout-btn">Logout</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(authModal);
        
        // Add event listeners
        this.setupEventListeners();
        this.initialized = true;
    }

    setupEventListeners() {
        // Toggle auth modal
        const userIcon = document.querySelector('.fa-user');
        const authModal = document.querySelector('.auth-modal');
        const closeAuth = document.querySelector('.close-auth');

        userIcon.addEventListener('click', () => {
            authModal.style.display = 'block';
            this.updateAuthState();
        });

        closeAuth.addEventListener('click', () => {
            authModal.style.display = 'none';
        });

        // Switch between login and register forms
        document.querySelectorAll('.switch-form a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const formToShow = link.dataset.form;
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                });
                document.getElementById(formToShow).classList.add('active');
            });
        });

        // Login form submission
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            this.login(email, password);
        });

        // Register form submission
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = registerForm.querySelector('input[type="text"]').value;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelectorAll('input[type="password"]')[0].value;
            const confirmPassword = registerForm.querySelectorAll('input[type="password"]')[1].value;
            this.register(name, email, password, confirmPassword);
        });

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        logoutBtn.addEventListener('click', () => this.logout());

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
            }
        });
    }

    updateAuthState() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const profileView = document.getElementById('profileView');

        if (this.currentUser) {
            loginForm.classList.remove('active');
            registerForm.classList.remove('active');
            profileView.classList.add('active');

            // Update profile info
            profileView.querySelector('.user-name').textContent = `Name: ${this.currentUser.name}`;
            profileView.querySelector('.user-email').textContent = `Email: ${this.currentUser.email}`;
        } else {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            profileView.classList.remove('active');
        }

        // Update user icon state
        const userIcon = document.querySelector('.fa-user');
        userIcon.className = this.currentUser ? 'fa-solid fa-user logged-in' : 'fa-solid fa-user';
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateAuthState();
            this.showMessage('Login successful!', 'success');
        } else {
            this.showMessage('Invalid email or password', 'error');
        }
    }

    register(name, email, password, confirmPassword) {
        // Validate password match
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        // Check if email already exists
        if (this.users.some(u => u.email === email)) {
            this.showMessage('Email already registered', 'error');
            return;
        }

        // Create new user
        const newUser = { name, email, password };
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        // Auto login after registration
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.updateAuthState();
        this.showMessage('Registration successful!', 'success');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateAuthState();
        this.showMessage('Logged out successfully', 'success');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});