// Contact Us Page JavaScript
// Handles contact form submission (test only - no actual sending)

// DOM Elements
const contactForm = document.getElementById('contactForm');
const messageDiv = document.getElementById('message');
const submitBtn = contactForm.querySelector('button[type="submit"]');

// Show message function
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'inherit';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageDiv.style.display = 'inherit';
    }, 5000);
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Handle form submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value.trim()
    };
    
    // Validate inputs
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (!validateEmail(formData.email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (formData.message.length < 10) {
        showMessage('Please provide a more detailed message (at least 10 characters)', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Message...';
    
    try {
        // Simulate form submission delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Log form data to console (for testing purposes)
        console.log('Contact Form Submission:', formData);
        
        // Show success message
        showMessage('Thank you for your message! We\'ll get back to you soon. (This is a test submission)', 'success');
        
        // Reset form
        contactForm.reset();

        
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('An error occurred while sending your message. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
});

// Auto-fill form if user is logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        try {
            const user = JSON.parse(currentUser);
            if (user.email) {
                document.getElementById('email').value = user.email;
            }
            if (user.fullname) {
                // Try to split fullname into first and last name
                const nameParts = user.fullname.split(' ');
                if (nameParts.length >= 2) {
                    document.getElementById('firstName').value = nameParts[0];
                    document.getElementById('lastName').value = nameParts.slice(1).join(' ');
                } else {
                    document.getElementById('firstName').value = user.fullname;
                }
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
});
