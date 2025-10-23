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
            register: 'src/client/login-register/register.html',
            logo: 'Assets/image/logoxe.jpg'
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
            register: '../login-register/register.html',
            logo: '../../../Assets/image/logoxe.jpg'
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
                <div class="brand" style="white-space: nowrap;">
                
                    <a href="${paths.home}" style="text-decoration: none; color: inherit;">
                    <img src="${paths.logo}" alt="404 not found" width="100px" style="border-radius:30px;"/>
                         Car Management
                    </a>
                </div>
                
                <ul class="nav-list" style="white-space: nowrap;">
                    <li><a href="${paths.home}" class="nav-link">Trang chủ</a></li>
                    <li><a href="${paths.cars}" class="nav-link">Danh mục xe</a></li>
                    <li><a href="${paths.services}" class="nav-link">Dịch vụ</a></li>
                    <li><a href="${paths.about}" class="nav-link">Về chúng tôi</a></li>
                    <li><a href="${paths.contact}" class="nav-link">Liên hệ</a></li>
                </ul>
                
                <div class="auth-actions" id="auth-actions" style="white-space: nowrap;">
                    
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
                        <i class="fa-solid fa-chart-line"> Dashboard
                    </a></li>
                    <li><a href="../manage-user/manage-user.html" class="sidebar-link">
                        <i class="fa-solid fa-user-group"></i> Manage Users
                    </a></li>
                    <li><a href="../manage-admin/manage-admin.html" class="sidebar-link">
                        <i class="fa-solid fa-wrench"></i> Manage Admins
                    </a></li>
                    <li><a href="../../../index.html" class="sidebar-link">
                        <i class="fa-solid fa-house"></i> Back to Site
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
                        <h4>Hệ thống Quản lý Xe</h4>
                        <p>Giải pháp quản lý xe chuyên nghiệp cho nhu cầu kinh doanh của bạn.</p>
                    </div>
                    <div class="footer-section">
                        <h4>Liên kết Nhanh</h4>
                        <ul>
                            <li><a href="${paths.home}">Trang Chủ</a></li>  
                            <li><a href="${paths.cars}">Xe</a></li>
                            <li><a href="${paths.services}">Dịch Vụ</a></li>
                            <li><a href="${paths.about}">Về Chúng Tôi</a></li>
                        </ul>
                    </div>
                    <div class="footer-section">
                        <h4>Thông Tin Liên Hệ</h4>
                        <p><i class="fa-solid fa-id-badge"></i> info@carmanagement.com</p>
                        <p><i class="fa-solid fa-phone"></i> +1 (555) 123-4567</p>
                        <p><i class="fa-solid fa-map-pin"></i> 123 Đường Xe, Thành Phố Tự Động</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 Hệ thống Quản lý Xe. Tất cả quyền được bảo lưu.</p>
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
            <a href="#" class="btn btn-link" onclick="logout()">Đăng xuất</a>
        `;
    } else {
        return `
            <a href="${paths.login}" class="btn btn-link">Đăng nhập</a>
            <a href="${paths.register}" class="btn btn-primary">Đăng ký</a>
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