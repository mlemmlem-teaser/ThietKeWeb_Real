// Service Page JavaScript
// Handles navigation and redirects for service page

// View new cars function
function viewNewCars() {
    // Redirect to product page to view cars
    window.location.href = '../product/product.html';
}

// Contact us function
function contactUs() {
    // Redirect to contact page
    window.location.href = '../contact-us/contact-us.html';
}

// View cars function
function viewCars() {
    // Redirect to product page to browse all cars
    window.location.href = '../product/product.html';
}

// Make functions global for onclick handlers
window.viewNewCars = viewNewCars;
window.contactUs = contactUs;
window.viewCars = viewCars;

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add click tracking for analytics (if needed)
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            // Could add analytics tracking here
            console.log('Service card clicked:', card.querySelector('h3').textContent);
        });
    });
    
    // Add animation to announcement banner
    const banner = document.querySelector('.announcement-banner');
    if (banner) {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            banner.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            banner.style.opacity = '1';
            banner.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Add staggered animation to service cards
    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 500 + (index * 100));
    });
});
