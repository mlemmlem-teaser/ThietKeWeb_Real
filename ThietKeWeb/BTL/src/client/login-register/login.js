// Login Page JavaScript
// Handles user authentication and form submission

import { loginUser } from '../api/firebase.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');
const loginBtn = loginForm.querySelector('button[type="submit"]');

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
loginForm.addEventListener('submit', async (e) => {
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
            // Check if user is admin - redirect to admin login
            if (result.user.role === 'admin') {
                showMessage('Admin account detected. Please use the admin login page.', 'error');
                setTimeout(() => {
                    window.location.href = '../../admin/login/admin-login.html';
                }, 2000);
                return;
            }
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to main site for regular users
            setTimeout(() => {
                window.location.href = '../../../index.html';
            }, 1500);
        } else {
            showMessage(result.error || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('An unexpected error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.role === 'admin') {
            // Redirect admin to admin login page
            window.location.href = '../../admin/login/admin-login.html';
        } else {
            // Redirect regular user to main site
            window.location.href = '../../../index.html';
        }
    }
});
