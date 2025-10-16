// Admin Management JavaScript
// Handles admin management functionality, search, and CRUD operations

import { getAllUsers, registerUser, updateUser, updateUserRole, deleteUser } from '../../client/api/firebase.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const adminsTableBody = document.getElementById('adminsTableBody');
const addAdminModal = document.getElementById('addAdminModal');
const addAdminForm = document.getElementById('addAdminForm');
const editAdminModal = document.getElementById('editAdminModal');
const editAdminForm = document.getElementById('editAdminForm');
const deleteModal = document.getElementById('deleteModal');

// State
let allAdmins = [];

// Check admin authentication
function checkAdminAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = '../../client/login-register/login.html';
        return false;
    }
    
    const user = JSON.parse(currentUser);
    if (user.role !== 'admin') {
        window.location.href = '../../../../index.html';
        return false;
    }
    
    return true;
}

// Load all admins
async function loadAdmins() {
    try {
        const result = await getAllUsers();
        if (result.success) {
            allAdmins = result.users.filter(user => user.status?.role === 'admin');
            updateStats();
            displayAdmins();
        } else {
            console.error('Error loading admins:', result.error);
            showMessage('Error loading admins', 'error');
        }
    } catch (error) {
        console.error('Error loading admins:', error);
        showMessage('An error occurred while loading admins', 'error');
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalAdmins').textContent = allAdmins.length;
    
    // Calculate new admins this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newAdmins = allAdmins.filter(admin => {
        if (!admin.createdAt) return false;
        const createdDate = new Date(admin.createdAt);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    document.getElementById('newAdmins').textContent = newAdmins;
    
    // For now, all admins are considered active
    document.getElementById('activeAdmins').textContent = allAdmins.length;
}

// Display admins in table
function displayAdmins() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredAdmins = allAdmins.filter(admin => {
        return !searchTerm || 
            admin.fullname?.toLowerCase().includes(searchTerm) ||
            admin.username?.toLowerCase().includes(searchTerm) ||
            admin.email?.toLowerCase().includes(searchTerm);
    });
    
    adminsTableBody.innerHTML = '';
    
    if (filteredAdmins.length === 0) {
        adminsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: var(--spacing-8); color: var(--color-muted);">
                    No admins found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    filteredAdmins.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="admin-name">${admin.fullname || 'N/A'}</div>
                <div class="admin-username" style="font-size: 0.9rem; color: var(--color-muted);">@${admin.username || 'N/A'}</div>
            </td>
            <td>
                <div class="admin-email">${admin.email || 'N/A'}</div>
            </td>
            <td>
                <div class="admin-avatar" style="font-size: 0.9rem;">
                    ${admin.avatar ? '🖼️ Has Avatar' : 'No Avatar'}
                </div>
            </td>
            <td>
                <div class="created-date">
                    N/A
                </div>
            </td>
            <td>
                <div class="updated-date">
                    N/A
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-link btn-small" onclick="editAdmin('${admin.id}')">
                        Edit
                    </button>
                    <button class="btn btn-link btn-small" onclick="deleteAdminConfirm('${admin.id}', '${admin.fullname}', '${admin.email}')" 
                            style="color: var(--color-error);">
                        Delete
                    </button>
                </div>
            </td>
        `;
        adminsTableBody.appendChild(row);
    });
}

// Show add admin modal
function showAddAdminModal() {
    addAdminModal.style.display = 'block';
    addAdminForm.reset();
}

// Close add admin modal
function closeAddAdminModal() {
    addAdminModal.style.display = 'none';
    addAdminForm.reset();
}

// Handle add admin form submission
addAdminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(addAdminForm);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const keyCode = formData.get('keyCode');
    
    // Validate key code
    if (keyCode !== '123456') {
        showMessage('Invalid admin key code. Please enter the correct 6-digit code.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    const adminData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        username: formData.get('email').split('@')[0],
        avatar: '',
        role: 'admin'
    };
    
    try {
        const result = await registerUser(formData.get('email'), password, adminData);
        if (result.success) {
            closeAddAdminModal();
            loadAdmins();
            showMessage('Admin created successfully!', 'success');
        } else {
            showMessage('Error creating admin: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error creating admin:', error);
        showMessage('An error occurred while creating the admin', 'error');
    }
});

// Edit admin
function editAdmin(adminId) {
    const admin = allAdmins.find(a => a.id === adminId);
    if (!admin) return;
    
    document.getElementById('editAdminId').value = admin.id;
    document.getElementById('editAdminFirstName').value = admin.fullname || '';
    document.getElementById('editAdminLastName').value = admin.username || '';
    document.getElementById('editAdminEmail').value = admin.email || '';
    document.getElementById('editAdminPhone').value = admin.avatar || '';
    
    editAdminModal.style.display = 'block';
}

// Close edit admin modal
function closeEditAdminModal() {
    editAdminModal.style.display = 'none';
    editAdminForm.reset();
}

// Handle edit admin form submission
editAdminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const adminId = document.getElementById('editAdminId').value;
    const fullname = document.getElementById('editAdminFirstName').value;
    const username = document.getElementById('editAdminLastName').value;
    const email = document.getElementById('editAdminEmail').value;
    const avatar = document.getElementById('editAdminPhone').value;
    
    try {
        const userData = {
            fullname: fullname,
            username: username,
            email: email,
            avatar: avatar,
            status: {
                role: 'admin',
                active: true
            }
        };
        
        const result = await updateUser(adminId, userData);
        if (result.success) {
            closeEditAdminModal();
            loadAdmins();
            showMessage('Admin updated successfully!', 'success');
        } else {
            showMessage('Error updating admin: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error updating admin:', error);
        showMessage('An error occurred while updating the admin', 'error');
    }
});

// Delete admin
function deleteAdminConfirm(adminId, adminName, adminEmail) {
    document.getElementById('deleteAdminName').textContent = adminName;
    document.getElementById('deleteAdminEmail').textContent = adminEmail;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = () => confirmDelete(adminId);
    
    deleteModal.style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    deleteModal.style.display = 'none';
}

// Confirm delete
async function confirmDelete(adminId) {
    try {
        const result = await deleteUser(adminId);
        if (result.success) {
            closeDeleteModal();
            loadAdmins();
            showMessage('Admin deleted successfully!', 'success');
        } else {
            showMessage('Error deleting admin: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error deleting admin:', error);
        showMessage('An error occurred while deleting the admin', 'error');
    }
}

// Refresh admins
function refreshAdmins() {
    loadAdmins();
}

// Show message
function showMessage(text, type) {
    // Create a simple alert for now
    alert(text);
}

// Event listeners
searchInput.addEventListener('input', displayAdmins);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === addAdminModal) {
        closeAddAdminModal();
    }
    if (e.target === editAdminModal) {
        closeEditAdminModal();
    }
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

// Make functions global for onclick handlers
window.showAddAdminModal = showAddAdminModal;
window.closeAddAdminModal = closeAddAdminModal;
window.editAdmin = editAdmin;
window.closeEditAdminModal = closeEditAdminModal;
window.deleteAdminConfirm = deleteAdminConfirm;
window.closeDeleteModal = closeDeleteModal;
window.refreshAdmins = refreshAdmins;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        loadAdmins();
    }
});