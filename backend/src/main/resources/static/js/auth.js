class AuthManager {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.init();
    }

    init() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
        
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', this.handleRegister.bind(this));
            
            // Show/hide company field based on role
            const roleSelect = document.getElementById('regRole');
            if (roleSelect) {
                roleSelect.addEventListener('change', this.handleRoleChange.bind(this));
            }
        }
    }

    handleRoleChange(event) {
        const companyGroup = document.getElementById('companyGroup');
        const selectedRole = event.target.value;
        
        if (selectedRole === 'seller' || selectedRole === 'courier') {
            companyGroup.style.display = 'block';
            document.getElementById('regCompany').required = true;
        } else {
            companyGroup.style.display = 'none';
            document.getElementById('regCompany').required = false;
        }
    }

   async handleLogin(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    Utils.showLoading(submitBtn);
    
    try {
        const formData = new FormData(event.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Direct fetch call - no Utils.makeAPICall
        const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Login failed');
        }

        const data = await response.json();

        // Store authentication data
        Utils.setAuthToken(data.accessToken || data.token);
        Utils.setUserInfo({
            id: data.id,
            email: data.email,
            roles: data.roles
        });

        Utils.showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect based on role
        this.redirectToDashboard(data.roles[0]);
        
    } catch (error) {
        Utils.showNotification(error.message || 'Login failed. Please try again.', 'error');
        console.error('Login error:', error);
    } finally {
        Utils.hideLoading(submitBtn);
    }
}


    async handleRegister(event) {
        event.preventDefault();
        
        const submitBtn = event.target.querySelector('button[type="submit"]');
        Utils.showLoading(submitBtn);
        
        try {
            const formData = new FormData(event.target);
            
            // Validate form data
            if (!this.validateRegistrationForm(formData)) {
                return;
            }
            
            const registerData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                password: formData.get('password'),
                role: [formData.get('role')],
                company: formData.get('company') || null
            };

            await Utils.makeAPICall('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(registerData)
            });

            Utils.showNotification('Registration successful! Please login to continue.', 'success');
            
            // Switch to login form
            setTimeout(() => {
                this.showLoginForm();
            }, 2000);
            
        } catch (error) {
            Utils.showNotification(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            Utils.hideLoading(submitBtn);
        }
    }

    validateRegistrationForm(formData) {
        const email = formData.get('email');
        const phone = formData.get('phone');
        const password = formData.get('password');
        
        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Please enter a valid email address.', 'error');
            return false;
        }
        
        if (!Utils.validatePhone(phone)) {
            Utils.showNotification('Please enter a valid phone number.', 'error');
            return false;
        }
        
        if (password.length < 6) {
            Utils.showNotification('Password must be at least 6 characters long.', 'error');
            return false;
        }
        
        return true;
    }

    redirectToDashboard(role) {
        setTimeout(() => {
            switch (role) {
                case 'ROLE_SELLER':
                    window.location.href = '/dashboard/seller.html';
                    break;
                case 'ROLE_BUYER':
                    window.location.href = '/dashboard/buyer.html';
                    break;
                case 'ROLE_COURIER':
                    window.location.href = '/dashboard/courier.html';
                    break;
                default:
                    window.location.href = '/dashboard/buyer.html';
            }
        }, 1500);
    }

    logout() {
        Utils.removeAuthToken();
        Utils.showNotification('Logged out successfully.', 'success');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
    }
}

// Global functions for form switching
function showRegisterForm() {
    const loginCard = document.querySelector('.auth-card:first-child');
    const registerCard = document.getElementById('registerCard');
    
    if (loginCard && registerCard) {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    }
}

function showLoginForm() {
    const loginCard = document.querySelector('.auth-card:first-child');
    const registerCard = document.getElementById('registerCard');
    
    if (loginCard && registerCard) {
        loginCard.style.display = 'block';
        registerCard.style.display = 'none';
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
});

// Export for other modules
window.AuthManager = AuthManager;
