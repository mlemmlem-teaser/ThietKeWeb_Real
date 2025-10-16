// Car Management JavaScript
// Handles car management functionality, search, filtering, and CRUD operations

import { getAllCars, addCar, updateCar, deleteCar } from '../../client/api/firebase.js';
import { buildInventoryFromApi } from '../../client/api/car-api.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const carsTableBody = document.getElementById('carsTableBody');
const addCarModal = document.getElementById('addCarModal');
const addCarForm = document.getElementById('addCarForm');
const editCarModal = document.getElementById('editCarModal');
const editCarForm = document.getElementById('editCarForm');
const deleteModal = document.getElementById('deleteModal');

// State
let allCars = [];
let filteredCars = [];

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

// Load all cars
async function loadCars() {
    try {
        const [fsResult, apiResult] = await Promise.all([
            getAllCars(),
            buildInventoryFromApi()
        ]);
        if (fsResult.success) {
            const fsCars = fsResult.cars.map(car => ({ ...car, _source: 'firestore' }));
            const apiCars = (apiResult.success ? apiResult.cars : []).map(c => ({
                id: `api-${c.id}`,
                CarName: `${c.make || c.make_name} ${c.model || c.name}`,
                CarBrand: c.make || c.make_name,
                CarModel: c.model || c.name,
                CarGeneration: c.year,
                CarPlate: '',
                CarKilometers: '',
                CarExterior: c.bodyType,
                CarInterior: 'Standard',
                CarStatus: c.status || 'available',
                _source: 'api'
            }));
            allCars = [...fsCars, ...apiCars];
            updateStats();
            applyFilters();
        } else {
            console.error('Error loading cars:', fsResult.error);
            showMessage('Error loading cars', 'error');
        }
    } catch (error) {
        console.error('Error loading cars:', error);
        showMessage('An error occurred while loading cars', 'error');
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalCars').textContent = allCars.length;
    
    const availableCars = allCars.filter(car => car.CarStatus === 'available').length;
    document.getElementById('availableCars').textContent = availableCars;
    
    const maintenanceCars = allCars.filter(car => car.CarStatus === 'maintenance').length;
    document.getElementById('maintenanceCars').textContent = maintenanceCars;
}

// Apply search and status filters
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilterValue = statusFilter.value;
    
    filteredCars = allCars.filter(car => {
        const matchesSearch = !searchTerm || 
            car.CarName?.toLowerCase().includes(searchTerm) ||
            car.CarBrand?.toLowerCase().includes(searchTerm) ||
            car.CarModel?.toLowerCase().includes(searchTerm) ||
            car.CarPlate?.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilterValue || car.CarStatus === statusFilterValue;
        
        return matchesSearch && matchesStatus;
    });
    
    displayCars();
}

// Display cars in table
function displayCars() {
    carsTableBody.innerHTML = '';
    
    if (filteredCars.length === 0) {
        carsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: var(--spacing-8); color: var(--color-muted);">
                    No cars found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    filteredCars.forEach(car => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="car-name">${car.CarName || 'N/A'}</div>
                <div class="car-brand">${car.CarBrand || 'N/A'}</div>
            </td>
            <td>
                <div>${car.CarBrand || 'N/A'}</div>
                <div class="car-brand">${car.CarModel || 'N/A'}</div>
            </td>
            <td>${car.CarGeneration || 'N/A'}</td>
            <td>
                <strong>${car.CarPlate || 'N/A'}</strong>
            </td>
            <td>${car.CarKilometers ? Number(car.CarKilometers).toLocaleString() + ' km' : 'N/A'}</td>
            <td>
                <span class="status-badge status-${car.CarStatus || 'available'}">
                    ${car.CarStatus || 'available'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-link btn-small" onclick="editCar('${car.id}')">
                        Edit
                    </button>
                    <button class="btn btn-link btn-small" onclick="promptUpdateImage('${car.id}')">
                        Add Image
                    </button>
                    <button class="btn btn-link btn-small" onclick="deleteCarConfirm('${car.id}', '${car.CarName}', '${car.CarPlate}')" 
                            style="color: var(--color-error);">
                        Delete
                    </button>
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
    addCarForm.reset();
}

// Handle add car form submission
addCarForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(addCarForm);
    const carData = {
        CarName: formData.get('CarName'),
        CarBrand: formData.get('CarBrand'),
        CarModel: formData.get('CarModel'),
        CarGeneration: formData.get('CarGeneration'),
        CarPlate: formData.get('CarPlate'),
        CarKilometers: formData.get('CarKilometers'),
        CarExterior: formData.get('CarExterior'),
        CarInterior: formData.get('CarInterior'),
        CarStatus: formData.get('CarStatus')
    };
    
    try {
        const result = await addCar(carData);
        if (result.success) {
            closeAddCarModal();
            loadCars();
            showMessage('Car added successfully!', 'success');
        } else {
            showMessage('Error adding car: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error adding car:', error);
        showMessage('An error occurred while adding the car', 'error');
    }
});

// Edit car
function editCar(carId) {
    const car = allCars.find(c => c.id === carId);
    if (!car) return;
    
    document.getElementById('editCarId').value = car.id;
    document.getElementById('editCarName').value = car.CarName || '';
    document.getElementById('editCarBrand').value = car.CarBrand || '';
    document.getElementById('editCarModel').value = car.CarModel || '';
    document.getElementById('editCarGeneration').value = car.CarGeneration || '';
    document.getElementById('editCarPlate').value = car.CarPlate || '';
    document.getElementById('editCarKilometers').value = car.CarKilometers || '';
    document.getElementById('editCarExterior').value = car.CarExterior || '';
    document.getElementById('editCarInterior').value = car.CarInterior || '';
    document.getElementById('editCarStatus').value = car.CarStatus || 'available';
    
    editCarModal.style.display = 'block';
}

// Close edit car modal
function closeEditCarModal() {
    editCarModal.style.display = 'none';
    editCarForm.reset();
}

// Handle edit car form submission
editCarForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const carId = document.getElementById('editCarId').value;
    const formData = new FormData(editCarForm);
    const carData = {
        CarName: formData.get('CarName'),
        CarBrand: formData.get('CarBrand'),
        CarModel: formData.get('CarModel'),
        CarGeneration: formData.get('CarGeneration'),
        CarPlate: formData.get('CarPlate'),
        CarKilometers: formData.get('CarKilometers'),
        CarExterior: formData.get('CarExterior'),
        CarInterior: formData.get('CarInterior'),
        CarStatus: formData.get('CarStatus')
    };
    
    try {
        const result = await updateCar(carId, carData);
        if (result.success) {
            closeEditCarModal();
            loadCars();
            showMessage('Car updated successfully!', 'success');
        } else {
            showMessage('Error updating car: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error updating car:', error);
        showMessage('An error occurred while updating the car', 'error');
    }
});

// Delete car
function deleteCarConfirm(carId, carName, carPlate) {
    document.getElementById('deleteCarName').textContent = carName;
    document.getElementById('deleteCarPlate').textContent = carPlate;
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = () => confirmDelete(carId);
    
    deleteModal.style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    deleteModal.style.display = 'none';
}

// Confirm delete
async function confirmDelete(carId) {
    try {
        const result = await deleteCar(carId);
        if (result.success) {
            closeDeleteModal();
            loadCars();
            showMessage('Car deleted successfully!', 'success');
        } else {
            showMessage('Error deleting car: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Error deleting car:', error);
        showMessage('An error occurred while deleting the car', 'error');
    }
}

// Refresh cars
function refreshCars() {
    loadCars();
}

// Show message
function showMessage(text, type) {
    // Create a simple alert for now
    alert(text);
}

// Make functions global for onclick handlers
window.showAddCarModal = showAddCarModal;
window.closeAddCarModal = closeAddCarModal;
window.editCar = editCar;
window.closeEditCarModal = closeEditCarModal;
window.deleteCarConfirm = deleteCarConfirm;
window.closeDeleteModal = closeDeleteModal;
window.refreshCars = refreshCars;
window.promptUpdateImage = async function(carId) {
    const url = prompt('Enter image URL for this car:');
    if (!url) return;
    try {
        const result = await updateCar(carId, { CarImage: url });
        if (result.success) {
            showMessage('Car image updated!', 'success');
            loadCars();
        } else {
            showMessage('Failed to update image: ' + result.error, 'error');
        }
    } catch (e) {
        console.error(e);
        showMessage('An error occurred while updating image', 'error');
    }
};

// Event listeners
searchInput.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === addCarModal) {
        closeAddCarModal();
    }
    if (e.target === editCarModal) {
        closeEditCarModal();
    }
    if (e.target === deleteModal) {
        closeDeleteModal();
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        loadCars();
    }
});
