// Cart Preview Component JavaScript
// Handles cart preview functionality and UI updates

import { getCartItems, removeFromCart, updateCartQuantity, clearCart, getCartTotal } from '../api/firebase.js';

// DOM Elements
let cartPreview = null;
let cartOverlay = null;
let cartItems = null;
let cartEmpty = null;
let cartFooter = null;
let cartTotalItems = null;
let cartTotalPrice = null;

// Initialize cart preview
export function initCartPreview() {
    // Load cart preview HTML
    loadCartPreviewHTML();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Update cart badge on page load
    updateCartBadge();
}

// Load cart preview HTML
function loadCartPreviewHTML() {
    // Check if cart preview already exists
    if (document.getElementById('cartPreview')) return;
    
    fetch('../components/cart-preview.html')
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            initCartElements();
        })
        .catch(error => {
            console.error('Error loading cart preview:', error);
            // Fallback: create cart preview inline
            createCartPreviewInline();
        });
}

// Create cart preview inline if HTML file can't be loaded
function createCartPreviewInline() {
    const cartHTML = `
        <div id="cartPreview" class="cart-preview">
            <div class="cart-header">
                <h3>🛒 Shopping Cart</h3>
                <button class="cart-close" onclick="closeCartPreview()">&times;</button>
            </div>
            
            <div class="cart-content">
                <div id="cartItems" class="cart-items"></div>
                
                <div class="cart-empty" id="cartEmpty" style="display: none;">
                    <div class="empty-icon">🛒</div>
                    <p>Your cart is empty</p>
                    <button class="btn btn-primary" onclick="closeCartPreview()">Continue Shopping</button>
                </div>
            </div>
            
            <div class="cart-footer" id="cartFooter">
                <div class="cart-total">
                    <div class="total-row">
                        <span>Total Items: <strong id="cartTotalItems">0</strong></span>
                    </div>
                    <div class="total-row">
                        <span>Total Price: <strong id="cartTotalPrice">$0.00</strong></span>
                    </div>
                </div>
                
                <div class="cart-actions">
                    <button class="btn btn-link" onclick="clearCart()">Clear Cart</button>
                    <button class="btn btn-primary" onclick="proceedToCheckout()">Checkout</button>
                </div>
            </div>
        </div>
        
        <div id="cartOverlay" class="cart-overlay" onclick="closeCartPreview()"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', cartHTML);
    initCartElements();
}

// Initialize cart DOM elements
function initCartElements() {
    cartPreview = document.getElementById('cartPreview');
    cartOverlay = document.getElementById('cartOverlay');
    cartItems = document.getElementById('cartItems');
    cartEmpty = document.getElementById('cartEmpty');
    cartFooter = document.getElementById('cartFooter');
    cartTotalItems = document.getElementById('cartTotalItems');
    cartTotalPrice = document.getElementById('cartTotalPrice');
    
    // Initial render
    renderCart();
}

// Show cart preview
export function showCartPreview() {
    if (cartPreview && cartOverlay) {
        cartPreview.classList.add('open');
        cartOverlay.classList.add('open');
        renderCart();
    }
}

// Close cart preview
export function closeCartPreview() {
    if (cartPreview && cartOverlay) {
        cartPreview.classList.remove('open');
        cartOverlay.classList.remove('open');
    }
}

// Handle cart update events
function handleCartUpdate(event) {
    renderCart();
    updateCartBadge();
}

// Render cart items
function renderCart() {
    const cartResult = getCartItems();
    const cart = cartResult.cart || [];
    
    if (!cartItems || !cartEmpty || !cartFooter) return;
    
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'block';
        cartFooter.style.display = 'none';
    } else {
        cartItems.style.display = 'block';
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.carData.CarImage || '../../../Assets/image/car_temp.png'}" alt="${item.carData.CarName}" onerror="this.src='../../../Assets/image/car_temp.png'">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.carData.CarName || 'Car'}</div>
                    <div class="cart-item-brand">${item.carData.CarBrand || 'Brand'} ${item.carData.CarModel || 'Model'}</div>
                    <div class="cart-item-price">$${(item.carData.CarPrice || 0).toLocaleString()}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.carId}', ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.carId}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeItem('${item.carId}')">Remove</button>
                </div>
            </div>
        `).join('');
        
        // Update totals
        if (cartTotalItems && cartTotalPrice) {
            const totalResult = getCartTotal();
            cartTotalItems.textContent = totalResult.itemCount;
            cartTotalPrice.textContent = `$${totalResult.total.toLocaleString()}`;
        }
    }
}

// Update cart badge
function updateCartBadge() {
    const cartBadges = document.querySelectorAll('.cart-badge');
    const totalResult = getCartTotal();
    const count = totalResult.itemCount;
    
    cartBadges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

// Update item quantity
function updateQuantity(itemId, newQuantity) {
    updateCartQuantity(itemId, newQuantity);
    renderCart();
    updateCartBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Remove item from cart
function removeItem(itemId) {
    removeFromCart(itemId);
    renderCart();
    updateCartBadge();
    window.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Clear entire cart
function clearCartData() {
    if (confirm('Are you sure you want to clear your cart?')) {
        clearCart();
        renderCart();
        updateCartBadge();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
}

// Proceed to checkout (placeholder)
function proceedToCheckout() {
    alert('Checkout functionality will be implemented soon!');
    closeCartPreview();
}

// Make functions global for onclick handlers
window.showCartPreview = showCartPreview;
window.closeCartPreview = closeCartPreview;
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.clearCart = clearCartData;
window.proceedToCheckout = proceedToCheckout;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCartPreview();
});

export { updateCartBadge };
