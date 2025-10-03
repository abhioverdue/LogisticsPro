// Global configuration
const API_BASE_URL = 'http://localhost:8080/api';
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// Utility functions
class Utils {
    static showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    static formatDate(dateString) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    static getAuthToken() {
        return localStorage.getItem('authToken');
    }

    static setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }

    static removeAuthToken() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
    }

    static getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    static setUserInfo(user) {
        localStorage.setItem('userInfo', JSON.stringify(user));
    }

    static async makeAPICall(endpoint, options = {}) {
        const token = this.getAuthToken();
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    static showLoading(element) {
        if (element) {
            element.classList.add('loading');
            const spinner = document.createElement('span');
            spinner.className = 'spinner';
            element.appendChild(spinner);
        }
    }

    static hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
            const spinner = element.querySelector('.spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
}

// Authentication check
function checkAuthStatus() {
    const token = Utils.getAuthToken();
    const userInfo = Utils.getUserInfo();
    
    if (token && userInfo) {
        return true;
    }
    
    // If on a protected page, redirect to login
    const protectedPages = ['/dashboard/', 'seller.html', 'buyer.html', 'courier.html'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.some(page => currentPath.includes(page))) {
        window.location.href = '/login.html';
        return false;
    }
    
    return false;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuthStatus();
    
    // Initialize theme
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Global error handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    Utils.showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Export utilities for other modules
window.Utils = Utils;
window.API_BASE_URL = API_BASE_URL;
window.GOOGLE_MAPS_API_KEY = GOOGLE_MAPS_API_KEY;
