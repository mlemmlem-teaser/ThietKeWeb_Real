// Register Page JavaScript
// Handles user registration and form validation

import { registerUser, getUserByUsername } from '../api/firebase.js';

// DOM Elements
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');
const registerBtn = registerForm.querySelector('button[type="submit"]');

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

// Validate password strength
function validatePassword(password) {
    if (password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    return null;
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number
function validatePhone(phone) {
    if (!phone) return null; // Phone is optional
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    // Check if phone has 10-12 digits
    return cleanPhone.length >= 10 && cleanPhone.length <= 12;
}

// Handle form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        fullname: document.getElementById('fullname').value.trim(),
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        avatar: document.getElementById('avatar').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        role: document.getElementById('role').value
    };
    
    // Validate inputs
    if (!formData.fullname || !formData.username || !formData.email || !formData.password) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (!validateEmail(formData.email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate username (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
        showMessage('Username can only contain letters, numbers, and underscores', 'error');
        return;
    }
    
    if (formData.username.length < 3) {
        showMessage('Username must be at least 3 characters long', 'error');
        return;
    }
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
        showMessage(passwordError, 'error');
        return;
    }
    
    if (formData.password !== formData.confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    // Show loading state
    registerBtn.disabled = true;
    registerBtn.textContent = 'Creating Account...';
    
    try {
        // Check if username is already taken
        const existingUser = await getUserByUsername(formData.username);
        if (existingUser) {
            showMessage('Username is already taken. Please choose another one.', 'error');
            return;
        }
        
        // Prepare user data for registration (force user role)
        const userData = {
            fullname: formData.fullname,
            username: formData.username,
            avatar: formData.avatar,
            role: 'user' // Force user role - admin accounts can only be created by admins
        };
        
        // Attempt registration
        const result = await registerUser(formData.email, formData.password, userData);
        
        if (result.success) {
            showMessage('Account created successfully! Redirecting...', 'success');
            
            // Redirect to main site (only regular users can register here)
            setTimeout(() => {
                window.location.href = '../../../index.html';
            }, 1500);
        } else {
            showMessage(result.error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('An unexpected error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        registerBtn.disabled = false;
        registerBtn.textContent = 'Create Account';
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
