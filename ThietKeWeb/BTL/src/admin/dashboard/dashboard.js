// Dashboard JavaScript
// Handles dashboard functionality, data loading, and car management

import { getAllCars, addCar, deleteCar, getAllUsers, migrateCarsToFirestore } from '../../client/api/firebase.js';
import { buildInventoryFromApi } from '../../client/api/car-api.js';

// DOM Elements
const totalCarsEl = document.getElementById('totalCars');
const totalUsersEl = document.getElementById('totalUsers');
const totalAdminsEl = document.getElementById('totalAdmins');
const recentActivityEl = document.getElementById('recentActivity');
const carsTableBody = document.getElementById('carsTableBody');
const addCarModal = document.getElementById('addCarModal');
const addCarForm = document.getElementById('addCarForm');

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

// Load dashboard statistics
async function loadStats() {
    try {
        // Load cars data
        const carsResult = await getAllCars();
        if (carsResult.success) {
            totalCarsEl.textContent = carsResult.cars.length;
        }
        
        // Load users data
        const usersResult = await getAllUsers();
        if (usersResult.success) {
            const users = usersResult.users;
            const numUsers = users.filter(user => (user.status && user.status.role) ? user.status.role === 'user' : false).length;
            const numAdmins = users.filter(user => (user.status && user.status.role) ? user.status.role === 'admin' : false).length;
            totalUsersEl.textContent = numUsers;
            totalAdminsEl.textContent = numAdmins;
        }
        
        // Set recent activity (placeholder)
        recentActivityEl.textContent = '12';
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load recent cars table
async function loadRecentCars() {
    try {
        // Try to load from API first, fallback to Firebase
        const apiResult = await buildInventoryFromApi();
        if (apiResult.success && apiResult.cars.length > 0) {
            const cars = apiResult.cars.slice(0, 10); // Show only recent 10 cars
            displayCarsTable(cars);
        } else {
            // Fallback to Firebase
            const result = await getAllCars();
            if (result.success) {
                const cars = result.cars.slice(0, 10); // Show only recent 10 cars
                displayCarsTable(cars);
            }
        }
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

// Display cars in table
function displayCarsTable(cars) {
    carsTableBody.innerHTML = '';
    
    if (cars.length === 0) {
        carsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: var(--spacing-8); color: var(--color-muted);">
                    No cars found. Add your first car!
                </td>
            </tr>
        `;
        return;
    }
    
    cars.forEach(car => {
        const row = document.createElement('tr');
        
        // Generate car display name
        const carName = car.make_name && car.name ? `${car.make_name} ${car.name}` : 
                       car.make && car.model ? `${car.make} ${car.model}` : 
                       car.name || 'Unknown Car';
        
        row.innerHTML = `
            <td>
                <img src="${car.CarImage || '../../../Assets/image/temp.png'}" alt="${carName}" class="car-image" onerror="this.src='../../../Assets/image/temp.png'">
            </td>
            <td>${carName}</td>
            <td>${car.year || 'N/A'}</td>
            <td>$${car.price?.toLocaleString() || 'N/A'}</td>
            <td><span class="status-badge status-${car.status || 'available'}">${car.status || 'available'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-link btn-small" onclick="editCar('${car.id}')">Edit</button>
                    <button class="btn btn-link btn-small" onclick="deleteCarConfirm('${car.id}')" style="color: var(--color-error);">Delete</button>
                </div>
            </td>
        `;
        carsTableBody.appendChild(row);
    });
}

// Show add car modal
function showAddCarModal() {
    addCarModal.style.display = 'block';
    addCarForm.reset();
}

// Close add car modal
function closeAddCarModal() {
    addCarModal.style.display = 'none';
}

// Handle add car form submission
addCarForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(addCarForm);
    const carData = {
        make: formData.get('make'),
        model: formData.get('model'),
        year: parseInt(formData.get('year')),
        price: parseFloat(formData.get('price')),
        description: formData.get('description'),
        status: formData.get('status')
    };
    
    try {
        const result = await addCar(carData);
        if (result.success) {
            closeAddCarModal();
            loadRecentCars();
            loadStats();
            alert('Car added successfully!');
        } else {
            alert('Error adding car: ' + result.error);
        }
    } catch (error) {
        console.error('Error adding car:', error);
        alert('An error occurred while adding the car.');
    }
});

// Delete car with confirmation
function deleteCarConfirm(carId) {
    if (confirm('Are you sure you want to delete this car?')) {
        deleteCar(carId).then(result => {
            if (result.success) {
                loadRecentCars();
                loadStats();
                alert('Car deleted successfully!');
            } else {
                alert('Error deleting car: ' + result.error);
            }
        }).catch(error => {
            console.error('Error deleting car:', error);
            alert('An error occurred while deleting the car.');
        });
    }
}

// Edit car (placeholder function)
function editCar(carId) {
    alert('Edit functionality will be implemented in the next version.');
}

// Refresh all data
function refreshData() {
    loadStats();
    loadRecentCars();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === addCarModal) {
        closeAddCarModal();
    }
});

// Initialize dashboard
// Migration Functions
function showMigrationModal() {
    const modal = document.getElementById('migrationModal');
    if (modal) {
        modal.style.display = 'block';
        // Reset modal state
        document.getElementById('migrationProgress').style.display = 'none';
        document.getElementById('migrationResults').style.display = 'none';
        document.getElementById('startMigrationBtn').disabled = false;
        document.getElementById('startMigrationBtn').textContent = 'Start Migration';
    }
}

function closeMigrationModal() {
    const modal = document.getElementById('migrationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function startMigration() {
    const startBtn = document.getElementById('startMigrationBtn');
    const progressDiv = document.getElementById('migrationProgress');
    const resultsDiv = document.getElementById('migrationResults');
    const statusEl = document.getElementById('migrationStatus');
    const summaryEl = document.getElementById('migrationSummary');
    const progressFill = document.getElementById('progressFill');
    
    try {
        // Disable button and show progress
        startBtn.disabled = true;
        startBtn.textContent = 'Migrating...';
        progressDiv.style.display = 'block';
        resultsDiv.style.display = 'none';
        
        statusEl.textContent = 'Fetching cars from API...';
        progressFill.style.width = '10%';
        
        // Fetch cars from API
        const apiResult = await buildInventoryFromApi();
        
        if (!apiResult.success) {
            throw new Error(apiResult.error || 'Failed to fetch cars from API');
        }
        
        statusEl.textContent = `Found ${apiResult.cars.length} cars. Starting migration...`;
        progressFill.style.width = '30%';
        
        // Migrate cars to Firestore
        const migrationResult = await migrateCarsToFirestore(apiResult.cars);
        
        if (!migrationResult.success) {
            throw new Error(migrationResult.error || 'Migration failed');
        }
        
        // Show results
        progressFill.style.width = '100%';
        statusEl.textContent = 'Migration completed!';
        
        summaryEl.innerHTML = `
            <strong>Migration Summary:</strong><br>
            • Total cars processed: ${migrationResult.total}<br>
            • Successfully migrated: ${migrationResult.successful}<br>
            • Failed migrations: ${migrationResult.failed}<br>
            • Success rate: ${Math.round((migrationResult.successful / migrationResult.total) * 100)}%
        `;
        
        resultsDiv.style.display = 'block';
        startBtn.textContent = 'Migration Complete';
        
        // Refresh data after successful migration
        setTimeout(() => {
            loadStats();
            loadRecentCars();
        }, 1000);
        
    } catch (error) {
        console.error('Migration error:', error);
        statusEl.textContent = `Error: ${error.message}`;
        startBtn.disabled = false;
        startBtn.textContent = 'Retry Migration';
    }
}

// Make functions global
window.showMigrationModal = showMigrationModal;
window.closeMigrationModal = closeMigrationModal;
window.startMigration = startMigration;

document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        loadStats();
        loadRecentCars();
    }
});
