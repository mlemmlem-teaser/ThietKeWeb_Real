// Product Page JavaScript
// Handles car listing, search, and filtering functionality with Firestore

import { getAllCars, addToCart } from '../api/firebase.js';
import { buildInventoryFromApi } from '../api/car-api.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const priceFilter = document.getElementById('priceFilter');
const carsGrid = document.getElementById('carsGrid');
const loadingMessage = document.getElementById('loadingMessage');
const noResultsMessage = document.getElementById('noResultsMessage');

// State
let allCars = [];
let filteredCars = [];

// Load all cars from Firestore
async function loadCars() {
    try {
        loadingMessage.style.display = 'block';
        noResultsMessage.style.display = 'none';
        carsGrid.innerHTML = '';
        
        // Show loading message
        loadingMessage.innerHTML = '<p>🔄 Loading cars from database and API...</p>';
        
        const [fsResult, apiResult] = await Promise.all([
            getAllCars(),
            buildInventoryFromApi()
        ]);

        if (fsResult.success) {
            const fsCars = fsResult.cars.map(car => ({
                id: car.id,
                CarBrand: car.CarBrand,
                CarModel: car.CarModel,
                CarName: car.CarName,
                CarGeneration: car.CarGeneration,
                CarExterior: car.CarExterior,
                CarInterior: car.CarInterior,
                CarKilometers: car.CarKilometers,
                CarPlate: car.CarPlate,
                CarImage: car.CarImage,
                price: Math.floor(Math.random() * 50000) + 10000,
                in_stock: Math.floor(Math.random() * 5) + 1,
                status: car.CarStatus || 'available',
                source: 'firestore'
            }));

            const apiCars = (apiResult.success ? apiResult.cars : []).map(c => ({
                id: `api-${c.id}`,
                CarBrand: c.make || c.make_name,
                CarModel: c.model || c.name,
                CarName: `${c.make || c.make_name} ${c.model || c.name}`,
                CarGeneration: c.year,
                CarExterior: c.bodyType,
                CarInterior: 'Standard',
                CarKilometers: undefined,
                CarPlate: undefined,
                CarImage: c.image,
                price: c.price,
                in_stock: c.in_stock || 1,
                status: c.status || 'available',
                source: 'api'
            }));

            allCars = [...fsCars, ...apiCars];
            applyFilters();
            
            // Update loading message
            loadingMessage.innerHTML = `<p>✅ Loaded ${allCars.length} cars successfully!</p>`;
            setTimeout(() => {
                loadingMessage.style.display = 'none';
            }, 2000);

            // Enable download report button when cars are ready
            const downloadBtn = document.getElementById('downloadBtn');
            if (downloadBtn) {
                downloadBtn.disabled = allCars.length === 0;
            }
        } else {
            console.error('Error loading cars:', result.error);
            showNoResults('Error loading cars from database. Please try again later.');
        }
    } catch (error) {
        console.error('Error loading cars:', error);
        showNoResults('An error occurred while loading cars from the database.');
    } finally {
        // Hide loading message after a delay
        setTimeout(() => {
            loadingMessage.style.display = 'none';
        }, 3000);
    }
}

// Apply search and price filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const priceFilterValue = priceFilter.value;
    
    filteredCars = allCars.filter(car => {
        const matchesSearch = !searchTerm || 
            car.CarBrand?.toLowerCase().includes(searchTerm) ||
            car.CarModel?.toLowerCase().includes(searchTerm) ||
            car.CarName?.toLowerCase().includes(searchTerm) ||
            car.CarGeneration?.toLowerCase().includes(searchTerm);
        
        const matchesPrice = !priceFilterValue || checkPriceRange(car.price, priceFilterValue);
        
        return matchesSearch && matchesPrice;
    });
    
    displayCars();
}

// Check if car price matches the selected range
function checkPriceRange(price, range) {
    if (!price) return false;
    
    switch (range) {
        case '0-10000':
            return price < 10000;
        case '10000-25000':
            return price >= 10000 && price <= 25000;
        case '25000-50000':
            return price >= 25000 && price <= 50000;
        case '50000+':
            return price > 50000;
        default:
            return true;
    }
}

// Display cars in grid
function displayCars() {
    carsGrid.innerHTML = '';
    
    if (filteredCars.length === 0) {
        showNoResults('No cars found matching your criteria.');
        return;
    }
    
    filteredCars.forEach(car => {
        const carCard = createCarCard(car);
        carsGrid.appendChild(carCard);
    });
}

// Create car card element
function createCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    
    // Generate car display name
    const carName = car.CarName || `${car.CarBrand || 'Unknown'} ${car.CarModel || 'Car'}`;
    
    // Generate additional details
    const details = [];
    if (car.CarGeneration) details.push(`<p><strong>Generation:</strong> ${car.CarGeneration}</p>`);
    if (car.CarExterior) details.push(`<p><strong>Exterior:</strong> ${car.CarExterior}</p>`);
    if (car.CarInterior) details.push(`<p><strong>Interior:</strong> ${car.CarInterior}</p>`);
    if (car.CarKilometers) details.push(`<p><strong>Kilometers:</strong> ${Number(car.CarKilometers).toLocaleString()} km</p>`);
    if (car.CarPlate) details.push(`<p><strong>Plate:</strong> ${car.CarPlate}</p>`);
    
    card.innerHTML = `
        <img src="${car.CarImage || '../../../Assets/image/car_temp.png'}" alt="${carName}" class="car-image" onerror="this.src='../../../Assets/image/car_temp.png'">
        <div class="car-content">
            <h3 class="car-title">${carName}</h3>
            <div class="car-details">
                ${details.join('')}
                <p><strong>Status:</strong> <span class="car-status status-${car.status || 'available'}">${car.status || 'available'}</span></p>
                <p><strong>Stock:</strong> ${car.in_stock || 1} available</p>
            </div>
            <div class="car-price">$${car.price?.toLocaleString() || 'N/A'}</div>
            <div class="car-description">
                <p>Quality ${car.CarBrand} ${car.CarModel} with excellent condition and performance.</p>
            </div>
            <div class="car-actions">
                <button class="btn btn-primary btn-small" onclick="viewCarDetails('${car.id}')">
                    View Details
                </button>
                <button class="btn btn-link btn-small" onclick="addToCartHandler('${car.id}')" ${car.in_stock <= 0 ? 'disabled' : ''}>
                    ${car.in_stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Show no results message
function showNoResults(message) {
    noResultsMessage.textContent = message;
    noResultsMessage.style.display = 'block';
}

// View car details (placeholder)
function viewCarDetails(carId) {
    const car = allCars.find(c => c.id == carId);
    if (car) {
        alert(`Car Details:\n\n${car.CarName || car.CarBrand + ' ' + car.CarModel}\nBrand: ${car.CarBrand}\nModel: ${car.CarModel}\nGeneration: ${car.CarGeneration}\nPrice: $${car.price?.toLocaleString()}\nExterior: ${car.CarExterior}\nInterior: ${car.CarInterior}\nKilometers: ${car.CarKilometers}\nPlate: ${car.CarPlate}\nStatus: ${car.CarStatus}`);
    } else {
        alert('Car details not found.');
    }
}

// Contact about car (placeholder)
function contactAboutCar(carId) {
    const car = allCars.find(c => c.id == carId);
    if (car) {
        alert(`Contact us about this ${car.make_name} ${car.name}!\n\nEmail: info@carmanagement.com\nPhone: +1 (555) 123-4567\n\nWe'll get back to you within 24 hours.`);
    } else {
        alert('Car information not found.');
    }
}

// Download car report
function downloadReport() {
    if (allCars.length === 0) {
        alert('No car data available. Please load cars first.');
        return;
    }
    
    const reportData = {
        timestamp: new Date().toISOString(),
        totalCars: allCars.length,
        cars: allCars
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'car_inventory_report.json';
    link.click();
}

// Cart Functions
function addToCartHandler(carId) {
    const car = allCars.find(c => c.id == carId);
    if (!car) {
        alert('Car not found.');
        return;
    }
    
    if (car.in_stock <= 0) {
        alert('This car is out of stock.');
        return;
    }
    
    // Prepare car data for cart
    const carData = {
        CarName: car.CarName,
        CarBrand: car.CarBrand,
        CarModel: car.CarModel,
        CarPrice: car.price,
        CarImage: car.CarImage || '../../../Assets/image/car_temp.png',
        CarStatus: car.CarStatus,
        CarDescription: car.CarDescription
    };
    
    const result = addToCart(carId, carData, 1);
    if (result.success) {
        alert(`${car.CarName || car.CarBrand + ' ' + car.CarModel} added to cart!`);
        // Trigger cart update event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        // Open cart preview and update badge if available
        try {
            if (typeof window.showCartPreview === 'function') {
                window.showCartPreview();
            }
        } catch (e) { /* noop */ }
    } else {
        alert('Error adding to cart: ' + result.error);
    }
}

function checkout() {
    alert('Checkout functionality - form submission does nothing as requested. Cart items logged to console.');
    console.log('Checkout form data:', {
        items: JSON.parse(localStorage.getItem('cart') || '[]'),
        timestamp: new Date().toISOString(),
        total: JSON.parse(localStorage.getItem('cart') || '[]').reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
}

// Event listeners
searchInput.addEventListener('input', applyFilters);
priceFilter.addEventListener('change', applyFilters);

// Make functions global for onclick handlers
window.viewCarDetails = viewCarDetails;
window.addToCartHandler = addToCartHandler;
window.loadCars = loadCars;
window.downloadReport = downloadReport;
window.checkout = checkout;

// Initialize page

function initCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}
document.addEventListener('DOMContentLoaded', () => {
    initCart();
    loadCars();
});