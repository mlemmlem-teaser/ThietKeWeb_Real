// Cart Management JavaScript
// Handles cart functionality, add/remove items, and cart preview

// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Add item to cart
export function addToCart(item) {
    try {
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item with quantity 1
            cart.push({
                ...item,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
        
        return { success: true, cart };
    } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: error.message };
    }
}

// Remove item from cart
export function removeFromCart(itemId) {
    try {
        cart = cart.filter(item => item.id !== itemId);
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
        
        return { success: true, cart };
    } catch (error) {
        console.error('Error removing from cart:', error);
        return { success: false, error: error.message };
    }
}

// Update item quantity in cart
export function updateCartItemQuantity(itemId, quantity) {
    try {
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex > -1) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = quantity;
            }
            
            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Trigger cart update event
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
        }
        
        return { success: true, cart };
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        return { success: false, error: error.message };
    }
}

// Get cart items
export function getCart() {
    return cart;
}

// Get cart total count
export function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Get cart total price
export function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Clear cart
export function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    return { success: true, cart: [] };
}

// Initialize cart from localStorage
export function initCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart;
}
