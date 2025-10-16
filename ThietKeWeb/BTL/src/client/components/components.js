// Global Components for Car Management System
// This file contains reusable components like navbar, sidebar, and footer

// Get correct path based on current page location
function getCorrectPath() {
    const currentPath = window.location.pathname;
    
    // If we're on index.html (root level)
    if (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '/') {
        return {
            home: 'index.html',
            cars: 'src/client/product/product.html',
            services: 'src/client/service/service.html',
            about: 'src/client/about-us/about-us.html',
            contact: 'src/client/contact-us/contact-us.html',
            login: 'src/client/login-register/login.html',
            register: 'src/client/login-register/register.html'
        };
    }
    // If we're in client subdirectories
    else if (currentPath.includes('/src/client/')) {
        return {
            home: '../../../index.html',
            cars: '../product/product.html',
            services: '../service/service.html',
            about: '../about-us/about-us.html',
            contact: '../contact-us/contact-us.html',
            login: '../login-register/login.html',
            register: '../login-register/register.html'
        };
    }
    // If we're in admin subdirectories
    else if (currentPath.includes('/src/admin/')) {
        return {
            home: '../../../../index.html',
            cars: '../../../client/product/product.html',
            services: '../../../client/service/service.html',
            about: '../../../client/about-us/about-us.html',
            contact: '../../../client/contact-us/contact-us.html',
            login: '../../../client/login-register/login.html',
            register: '../../../client/login-register/register.html'
        };
    }
    // Default fallback
    else {
        return {
            home: 'index.html',
            cars: 'src/client/product/product.html',
            services: 'src/client/service/service.html',
            about: 'src/client/about-us/about-us.html',
            contact: 'src/client/contact-us/contact-us.html',
            login: 'src/client/login-register/login.html',
            register: 'src/client/login-register/register.html'
        };
    }
}

// Navbar Component (original BTL)
function createNavbar() {
    const paths = getCorrectPath();
    
    return `
        <nav class="site-header">
            <div class="container">
                <div class="brand">
                    <a href="${paths.home}" style="text-decoration: none; color: inherit;">
                        🚗 Car Management
                    </a>
                </div>
                
                <ul class="nav-list">
                    <li><a href="${paths.home}" class="nav-link">Home</a></li>
                    <li><a href="${paths.cars}" class="nav-link">Cars</a></li>
                    <li><a href="${paths.services}" class="nav-link">Services</a></li>
                    <li><a href="${paths.about}" class="nav-link">About</a></li>
                    <li><a href="${paths.contact}" class="nav-link">Contact</a></li>
                </ul>
                
                <div class="auth-actions" id="auth-actions">
                    <!-- Auth buttons will be dynamically inserted here -->
                </div>
            </div>
        </nav>
    `;
}

// Sidebar Component for Admin Pages
function createSidebar() {
    return `
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <h3>Admin Panel</h3>
            </div>
            <nav class="sidebar-nav">
                <ul>
                    <li><a href="../dashboard/dashboard.html" class="sidebar-link">
                        📊 Dashboard
                    </a></li>
                    <li><a href="../manage-user/manage-user.html" class="sidebar-link">
                        👥 Manage Users
                    </a></li>
                    <li><a href="../manage-admin/manage-admin.html" class="sidebar-link">
                        🔧 Manage Admins
                    </a></li>
                    <li><a href="../../../index.html" class="sidebar-link">
                        🏠 Back to Site
                    </a></li>
                </ul>
            </nav>
        </aside>
    `;
}

// Footer Component (original BTL)
function createFooter() {
    const paths = getCorrectPath();
    
    return `
        <footer class="site-footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h4>Car Management System</h4>
                        <p>Professional car management solution for your business needs.</p>
                    </div>
                    <div class="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="${paths.home}">Home</a></li>
                            <li><a href="${paths.cars}">Cars</a></li>
                            <li><a href="${paths.services}">Services</a></li>
                            <li><a href="${paths.about}">About Us</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Contact Info</h4>
                        <p>📧 info@carmanagement.com</p>
                        <p>📞 +1 (555) 123-4567</p>
                        <p>📍 123 Car Street, Auto City</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 Car Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
}

// Auth Buttons Component
function createAuthButtons() {
    const user = getCurrentUser();
    const paths = getCorrectPath();
    
    if (user) {
        return `
            <span class="user-info">Welcome, ${user.email}</span>
            <a href="#" class="btn btn-link" onclick="logout()">Logout</a>
        `;
    } else {
        return `
            <a href="${paths.login}" class="btn btn-link">Login</a>
            <a href="${paths.register}" class="btn btn-primary">Register</a>
        `;
    }
}

// Initialize Components
function initializeComponents() {
    // Load navbar
    const headerElement = document.getElementById('site-header');
    if (headerElement) {
        headerElement.innerHTML = createNavbar();
    }
    
    // Load sidebar for admin pages
    const sidebarElement = document.getElementById('admin-sidebar');
    if (sidebarElement) {
        sidebarElement.innerHTML = createSidebar();
    }
    
    // Load footer
    const footerElement = document.getElementById('site-footer');
    if (footerElement) {
        footerElement.innerHTML = createFooter();
    }
    
    // Update auth buttons
    updateAuthButtons();

}

// Update auth buttons based on login status
function updateAuthButtons() {
    const authActions = document.getElementById('auth-actions');
    if (authActions) {
        authActions.innerHTML = createAuthButtons();
    }
}

// Get current user from localStorage
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    updateAuthButtons();
    const paths = getCorrectPath();
    window.location.href = paths.home;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Redirect to login if not authenticated
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        const paths = getCorrectPath();
        window.location.href = paths.login;
        return false;
    }
    return true;
}

// Redirect to login if not admin
function requireAdmin() {
    if (!requireAuth() || !isAdmin()) {
        const paths = getCorrectPath();
        window.location.href = paths.login;
        return false;
    }
    return true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeComponents);