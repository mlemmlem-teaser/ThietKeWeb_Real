// Admin Sidebar Component JavaScript - Simple and Reliable
// Handles sidebar functionality, navigation, and user management

import { logoutUser } from '../../client/api/firebase.js';

// Initialize sidebar
function initAdminSidebar() {
    // Check if sidebar container exists
    const sidebarContainer = document.getElementById('admin-sidebar');
    if (!sidebarContainer) {
        console.error('Admin sidebar container not found');
        return;
    }
    
    // Load sidebar HTML
    loadSidebarHTML();
    
    // Set active navigation item
    setActiveNavItem();
    
    // Load user info
    loadUserInfo();
    
    // Add mobile menu functionality
    addMobileMenuFunctionality();
}

// Load sidebar HTML into the page
function loadSidebarHTML() {
    const sidebarContainer = document.getElementById('admin-sidebar');
    if (!sidebarContainer) return;
    
    // Create sidebar inline to avoid path issues
    createSidebarInline();
}

// Create sidebar inline to avoid path issues
function createSidebarInline() {
    const sidebarContainer = document.getElementById('admin-sidebar');
    if (!sidebarContainer) return;
    
    sidebarContainer.innerHTML = `
        <aside class="admin-sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">
                    <h2>🚗 Admin Panel</h2>
                </div>
            </div>
            
            <div class="sidebar-user">
                <div class="user-avatar">👤</div>
                <div class="user-info">
                    <div class="user-name" id="adminUserName">Admin User</div>
                    <div class="user-role">Administrator</div>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <ul class="nav-list">
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="dashboard">
                            <span class="nav-icon">📊</span>
                            <span class="nav-text">Dashboard</span>
                        </a>
                    </li>
                    
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="manage-user">
                            <span class="nav-icon">👥</span>
                            <span class="nav-text">Manage Users</span>
                        </a>
                    </li>
                    
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="manage-admin">
                            <span class="nav-icon">🔧</span>
                            <span class="nav-text">Manage Admins</span>
                        </a>
                    </li>
                    
                    <li class="nav-item">
                        <a href="#" class="nav-link" data-page="manage-cars">
                            <span class="nav-icon">🚗</span>
                            <span class="nav-text">Manage Cars</span>
                        </a>
                    </li>
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <div class="footer-actions">
                    <button class="btn btn-link sidebar-btn" onclick="goToMainSite()">
                        <span class="nav-icon">🏠</span>
                        <span class="nav-text">Main Site</span>
                    </button>
                    
                    <button class="btn btn-link sidebar-btn" onclick="adminLogout()">
                        <span class="nav-icon">🚪</span>
                        <span class="nav-text">Logout</span>
                    </button>
                </div>
            </div>
        </aside>
    `;
    
    setTimeout(() => {
        setActiveNavItem();
        loadUserInfo();
        addNavigationHandlers();
    }, 100);
}

// Set active navigation item based on current page
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Check if current page matches the link
        const page = link.getAttribute('data-page');
        if (currentPath.includes(page)) {
            link.classList.add('active');
        }
    });
}

// Load current user info into sidebar
function loadUserInfo() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            const userNameElement = document.getElementById('adminUserName');
            if (userNameElement) {
                userNameElement.textContent = user.fullname || user.email || 'Admin User';
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
}

// Add navigation click handlers
function addNavigationHandlers() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            
            const page = link.getAttribute('data-page');
            const currentPath = window.location.pathname;
            
            // Determine the correct path based on current location
            let targetPath;
            
            if (currentPath.includes('/dashboard/')) {
                // We're in dashboard folder
                switch(page) {
                    case 'dashboard': targetPath = 'dashboard.html'; break;
                    case 'manage-user': targetPath = '../manage-user/manage-user.html'; break;
                    case 'manage-admin': targetPath = '../manage-admin/manage-admin.html'; break;
                    case 'manage-cars': targetPath = '../manage-cars/manage-cars.html'; break;
                }
            } else if (currentPath.includes('/manage-user/')) {
                // We're in manage-user folder
                switch(page) {
                    case 'dashboard': targetPath = '../dashboard/dashboard.html'; break;
                    case 'manage-user': targetPath = 'manage-user.html'; break;
                    case 'manage-admin': targetPath = '../manage-admin/manage-admin.html'; break;
                    case 'manage-cars': targetPath = '../manage-cars/manage-cars.html'; break;
                }
            } else if (currentPath.includes('/manage-admin/')) {
                // We're in manage-admin folder
                switch(page) {
                    case 'dashboard': targetPath = '../dashboard/dashboard.html'; break;
                    case 'manage-user': targetPath = '../manage-user/manage-user.html'; break;
                    case 'manage-admin': targetPath = 'manage-admin.html'; break;
                    case 'manage-cars': targetPath = '../manage-cars/manage-cars.html'; break;
                }
            } else if (currentPath.includes('/manage-cars/')) {
                // We're in manage-cars folder
                switch(page) {
                    case 'dashboard': targetPath = '../dashboard/dashboard.html'; break;
                    case 'manage-user': targetPath = '../manage-user/manage-user.html'; break;
                    case 'manage-admin': targetPath = '../manage-admin/manage-admin.html'; break;
                    case 'manage-cars': targetPath = 'manage-cars.html'; break;
                }
            }
            
            if (targetPath) {
                window.location.href = targetPath;
            }
        });
    });
}

// Add mobile menu functionality
function addMobileMenuFunctionality() {
    // Create mobile menu button if it doesn't exist
    if (!document.querySelector('.mobile-menu-btn')) {
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'mobile-menu-btn';
        mobileBtn.innerHTML = '☰';
        mobileBtn.onclick = toggleMobileSidebar;
        document.body.appendChild(mobileBtn);
    }
}

// Toggle mobile sidebar
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// Go to main site
function goToMainSite() {
    const currentPath = window.location.pathname;
    let mainSitePath;
    
    if (currentPath.includes('/dashboard/')) {
        mainSitePath = '../../../index.html';
    } else if (currentPath.includes('/manage-user/') || currentPath.includes('/manage-admin/') || currentPath.includes('/manage-cars/')) {
        mainSitePath = '../../../../index.html';
    } else {
        mainSitePath = '../../index.html';
    }
    
    window.location.href = mainSitePath;
}

// Admin logout function
async function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await logoutUser();
            window.location.href = '../login/admin-login.html';
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if there's an error
            localStorage.removeItem('currentUser');
            window.location.href = '../login/admin-login.html';
        }
    }
}

// Make functions global for onclick handlers
window.goToMainSite = goToMainSite;
window.adminLogout = adminLogout;
window.toggleMobileSidebar = toggleMobileSidebar;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initAdminSidebar();
});

// Export functions for manual initialization
export { initAdminSidebar, setActiveNavItem, loadUserInfo };