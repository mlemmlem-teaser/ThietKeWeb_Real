// User Management JavaScript
// Handles user management functionality, search, filtering, and CRUD operations

import { getAllUsers, updateUser, updateUserRole, deleteUser } from '../../client/api/firebase.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const roleFilter = document.getElementById('roleFilter');
const usersTableBody = document.getElementById('usersTableBody');
const editUserModal = document.getElementById('editUserModal');
const editUserForm = document.getElementById('editUserForm');
const deleteModal = document.getElementById('deleteModal');
const pagination = document.getElementById('pagination');

// State
let allUsers = [];
let filteredUsers = [];
let currentPage = 1;
const usersPerPage = 10;

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

// Load all users
async function loadUsers() {
    try {
        const result = await getAllUsers();
        if (result.success) {
            allUsers = result.users;
            applyFilters();
        } else {
            console.error('Error loading users:', result.error);
            showMessage('Error loading users', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showMessage('An error occurred while loading users', 'error');
    }
}

// Apply search and role filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const roleFilterValue = roleFilter.value;
    
    filteredUsers = allUsers.filter(user => {
        const matchesSearch = !searchTerm || 
            user.fullname?.toLowerCase().includes(searchTerm) ||
            user.username?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm);
        
        const matchesRole = !roleFilterValue || user.status?.role === roleFilterValue;
        
        return matchesSearch && matchesRole;
    });
    
    currentPage = 1;
    displayUsers();
    displayPagination();
}

// Display users in table
function displayUsers() {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);
    
    usersTableBody.innerHTML = '';
    
    if (usersToShow.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: var(--spacing-8); color: var(--color-muted);">
                    No users found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    usersToShow.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="user-name">${user.fullname || 'N/A'}</div>
                <div class="user-username" style="font-size: 0.9rem; color: var(--color-muted);">@${user.username || 'N/A'}</div>
            </td>
            <td>
                <div class="user-email">${user.email || 'N/A'}</div>
            </td>
            <td>
                <div class="user-avatar" style="font-size: 0.9rem;">
                    ${user.avatar ? '🖼️ Has Avatar' : 'No Avatar'}
                </div>
            </td>
            <td>
                <span class="role-badge role-${user.status?.role || 'user'}">
                    ${user.status?.role || 'user'}
                </span>
                <div style="font-size: 0.8rem; color: var(--color-muted);">
                    ${user.status?.active ? '✅ Active' : '❌ Inactive'}
                </div>
            </td>
            <td>
                <div class="created-date">
                    N/A
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-link btn-small" onclick="editUser('${user.id}')">
                        Edit
                    </button>
                    <button class="btn btn-link btn-small" onclick="deleteUserConfirm('${user.id}', '${user.fullname}', '${user.email}')" 
                            style="color: var(--color-error);">
                        Delete
                    </button>
                </div>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Display pagination
function displayPagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            Previous
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            Next
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayUsers();
        displayPagination();
    }
}

// Edit user
function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editFirstName').value = user.fullname || '';
    document.getElementById('editLastName').value = user.username || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.avatar || '';
    document.getElementById('editRole').value = user.status?.role || 'user';
    
    editUserModal.style.display = 'block';
}

// Close edit user modal
function closeEditUserModal() {
    editUserModal.style.display = 'none';
    editUserForm.reset();
}

// Handle edit user form submission
editUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const fullname = document.getElementById('editFirstName').value;
    const username = document.getElementById('editLastName').value;
    const email = document.getElementById('editEmail').value;
    const avatar = document.getElementById('editPhone').value;
    const newRole = document.getElementById('editRole').value;
    
    try {
        const userData = {
            fullname: fullname,
            username: username,
            email: email,
            avatar: avatar,
            status: {
                role: newRole,
                active: true
            }
        };
        
        const result = await updateUser(userId, userData);
        if (result.success) {
            closeEditUserModal();
            loadUsers();
            showMessage('User updated successfully!', 'success');
        } else {
            showMessage('Error updating user: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage('An error occurred while updating the user', 'error');
    }
});

// Delete user
function deleteUserConfirm(userId, userName, userEmail) {
    document.getElementById('deleteUserName').textContent = userName;
    document.getElementById('deleteUserEmail').textContent = userEmail;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = () => confirmDelete(userId);
    
    deleteModal.style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    deleteModal.style.display = 'none';
}

// Confirm delete
async function confirmDelete(userId) {
    try {
        const result = await deleteUser(userId);
        if (result.success) {
            closeDeleteModal();
            loadUsers();
            showMessage('User deleted successfully!', 'success');
        } else {
            showMessage('Error deleting user: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('An error occurred while deleting the user', 'error');
    }
}

// Refresh users
function refreshUsers() {
    loadUsers();
}

// Show message
function showMessage(text, type) {
    // Create a simple alert for now
    alert(text);
}

// Event listeners
searchInput.addEventListener('input', applyFilters);
roleFilter.addEventListener('change', applyFilters);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === editUserModal) {
        closeEditUserModal();
    }
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

// Make functions global for onclick handlers
window.editUser = editUser;
window.closeEditUserModal = closeEditUserModal;
window.deleteUserConfirm = deleteUserConfirm;
window.closeDeleteModal = closeDeleteModal;
window.refreshUsers = refreshUsers;
window.changePage = changePage;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        loadUsers();
    }
});