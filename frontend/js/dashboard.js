// Dashboard common functionality

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    checkAuthentication();
});

// Load user information into the dashboard
function loadUserInfo() {
    const userEmail = localStorage.getItem('userEmail');
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || '[]');
    
    // Update username display
    const userNameElement = document.getElementById('userName');
    if (userNameElement && userEmail) {
        // Extract name from email (before @)
        const username = userEmail.split('@')[0];
        userNameElement.textContent = username;
    }
    
    // Update user avatar
    const userAvatarElement = document.getElementById('userAvatar');
    if (userAvatarElement && userEmail) {
        userAvatarElement.textContent = userEmail.charAt(0).toUpperCase();
    }
    
    console.log('User loaded:', { email: userEmail, roles: userRoles });
}

// Check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        console.log('No auth token found, redirecting to login...');
        window.location.href = '/login.html';
        return false;
    }
    
    return true;
}

// Logout function
function logout() {
    console.log('Logging out...');
    
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userInfo');
    
    // Show success notification
    if (typeof Utils !== 'undefined' && Utils.showNotification) {
        Utils.showNotification('Logged out successfully!', 'success');
    } else {
        alert('Logged out successfully!');
    }
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 1000);
}

// Make logout function globally available
window.logout = logout;

// Export functions for other scripts
window.DashboardUtils = {
    loadUserInfo,
    checkAuthentication,
    logout
};
