// Admin Login Page JavaScript
// Handles admin authentication and form submission

import { loginUser } from '../../client/api/firebase.js';

// DOM Elements
const adminLoginForm = document.getElementById('adminLoginForm');
const messageDiv = document.getElementById('message');
const loginBtn = adminLoginForm.querySelector('button[type="submit"]');

// Show message function
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Handle form submission
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const emailOrUsername = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate inputs
    if (!emailOrUsername || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        // Attempt login
        const result = await loginUser(emailOrUsername, password);
        
        if (result.success) {
            // Check if user is admin
            if (result.user.role !== 'admin') {
                showMessage('Access denied. This login is for administrators only.', 'error');
                return;
            }
            
            showMessage('Admin login successful! Redirecting to dashboard...', 'success');
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = '../dashboard/dashboard.html';
            }, 1500);
        } else {
            showMessage(result.error || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showMessage('An unexpected error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login to Dashboard';
    }
});

// Check if admin is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.role === 'admin') {
            // Redirect to dashboard if already logged in as admin
            window.location.href = '../dashboard/dashboard.html';
        }
    }
});
