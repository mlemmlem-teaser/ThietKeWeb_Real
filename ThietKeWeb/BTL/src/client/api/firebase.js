// Firebase API Helper Functions
// This file contains all Firebase-related functions for authentication and database operations

import { auth, dbFireStore } from '../../../config-firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
} from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js';

// Authentication Functions

// Login user with email/username and password
export async function loginUser(emailOrUsername, password) {
    try {
        let email = emailOrUsername;
        
        // If input doesn't contain @, treat it as username and find email
        if (!emailOrUsername.includes('@')) {
            const userByUsername = await getUserByUsername(emailOrUsername);
            if (!userByUsername) {
                return { success: false, error: 'Username not found' };
            }
            email = userByUsername.email;
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userData = await getUserData(user.uid);
        
        // Store user data in localStorage
        const userInfo = {
            uid: user.uid,
            email: user.email,
            role: userData?.status?.role || 'user',
            fullname: userData?.fullname || '',
            username: userData?.username || ''
        };
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        
        return { success: true, user: userInfo };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Get user by username
export async function getUserByUsername(username) {
    try {
        const q = query(collection(dbFireStore, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user by username:', error);
        return null;
    }
}

// Get user data by UID
export async function getUserData(uid) {
    try {
        const q = query(collection(dbFireStore, 'users'), where('id', '==', uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Register new user
export async function registerUser(email, password, userData = {}) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Add user data to Firestore
        await addDoc(collection(dbFireStore, 'users'), {
            id: user.uid,
            email: user.email,
            fullname: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            username: userData.username || user.email.split('@')[0],
            avatar: userData.avatar || '',
            status: {
                role: userData.role || 'user',
                active: true
            }
        });
        
        // Store user data in localStorage
        const userInfo = {
            uid: user.uid,
            email: user.email,
            role: userData.role || 'user'
        };
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        
        return { success: true, user: userInfo };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

// Logout user
export async function logoutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem('currentUser');
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
}

// Get user role from Firestore
export async function getUserRole(uid) {
    try {
        const q = query(collection(dbFireStore, 'users'), where('id', '==', uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return userDoc.data().status?.role || 'user';
        }
        return 'user';
    } catch (error) {
        console.error('Error getting user role:', error);
        return 'user';
    }
}

// Database Functions

// Add car to database
export async function addCar(carData) {
    try {
        const docRef = await addDoc(collection(dbFireStore, 'cars'), {
            CarBrand: carData.CarBrand || '',
            CarExterior: carData.CarExterior || '',
            CarInterior: carData.CarInterior || '',
            CarGeneration: carData.CarGeneration || '',
            CarKilometers: carData.CarKilometers || '',
            CarModel: carData.CarModel || '',
            CarName: carData.CarName || '',
            CarPlate: carData.CarPlate || '',
            CarStatus: carData.CarStatus || 'available'
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding car:', error);
        return { success: false, error: error.message };
    }
}

// Get all cars
export async function getAllCars() {
    try {
        const querySnapshot = await getDocs(collection(dbFireStore, 'cars'));
        const cars = [];
        querySnapshot.forEach((doc) => {
            cars.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, cars };
    } catch (error) {
        console.error('Error getting cars:', error);
        return { success: false, error: error.message };
    }
}

// Update car
export async function updateCar(carId, carData) {
    try {
        const carRef = doc(dbFireStore, 'cars', carId);
        const updateData = {};
        
        // Only update provided fields
        if (carData.CarBrand !== undefined) updateData.CarBrand = carData.CarBrand;
        if (carData.CarExterior !== undefined) updateData.CarExterior = carData.CarExterior;
        if (carData.CarInterior !== undefined) updateData.CarInterior = carData.CarInterior;
        if (carData.CarGeneration !== undefined) updateData.CarGeneration = carData.CarGeneration;
        if (carData.CarKilometers !== undefined) updateData.CarKilometers = carData.CarKilometers;
        if (carData.CarModel !== undefined) updateData.CarModel = carData.CarModel;
        if (carData.CarName !== undefined) updateData.CarName = carData.CarName;
        if (carData.CarPlate !== undefined) updateData.CarPlate = carData.CarPlate;
        if (carData.CarStatus !== undefined) updateData.CarStatus = carData.CarStatus;
        if (carData.CarImage !== undefined) updateData.CarImage = carData.CarImage;
        
        await updateDoc(carRef, updateData);
        return { success: true };
    } catch (error) {
        console.error('Error updating car:', error);
        return { success: false, error: error.message };
    }
}

// Delete car
export async function deleteCar(carId) {
    try {
        await deleteDoc(doc(dbFireStore, 'cars', carId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting car:', error);
        return { success: false, error: error.message };
    }
}

// Get all users
export async function getAllUsers() {
    try {
        const querySnapshot = await getDocs(collection(dbFireStore, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, users };
    } catch (error) {
        console.error('Error getting users:', error);
        return { success: false, error: error.message };
    }
}

// Update user
export async function updateUser(userId, userData) {
    try {
        const userRef = doc(dbFireStore, 'users', userId);
        const updateData = {};
        
        // Only update provided fields
        if (userData.fullname !== undefined) updateData.fullname = userData.fullname;
        if (userData.email !== undefined) updateData.email = userData.email;
        if (userData.username !== undefined) updateData.username = userData.username;
        if (userData.avatar !== undefined) updateData.avatar = userData.avatar;
        if (userData.status !== undefined) updateData.status = userData.status;
        
        await updateDoc(userRef, updateData);
        return { success: true };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
    }
}

// Update user role
export async function updateUserRole(userId, newRole) {
    try {
        const userRef = doc(dbFireStore, 'users', userId);
        await updateDoc(userRef, {
            'status.role': newRole
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: error.message };
    }
}

// Delete user
export async function deleteUser(userId) {
    try {
        await deleteDoc(doc(dbFireStore, 'users', userId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: error.message };
    }
}

// Auth state listener
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Car Migration Functions

// Add car to Firestore
export async function addCarToFirestore(carData) {
    try {
        const carRef = await addDoc(collection(dbFireStore, 'cars'), {
            CarName: carData.name || carData.model || 'Unknown Car',
            CarBrand: carData.make_name || carData.make || 'Unknown Brand',
            CarModel: carData.model || carData.name || 'Unknown Model',
            CarGeneration: carData.year || 2024,
            CarPlate: `PLATE-${carData.id || Date.now()}`,
            CarKilometers: Math.floor(Math.random() * 100000) + 10000,
            CarExterior: carData.bodyType || 'Standard',
            CarInterior: 'Standard',
            CarStatus: carData.status || 'available',
            CarPrice: carData.price || 25000,
            CarDescription: carData.description || 'A quality vehicle',
            CarImage: carData.image || '../../../Assets/image/car_temp.png',
            CarStock: carData.stock || 1,
            CarSold: carData.sold || 0,
            CarEngineType: carData.engineType || 'Standard',
            CarHorsepower: carData.horsepower || 150,
            CarDoors: carData.doors || 4,
            CarBodyType: carData.bodyType || 'Sedan',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return { success: true, id: carRef.id };
    } catch (error) {
        console.error('Error adding car to Firestore:', error);
        return { success: false, error: error.message };
    }
}

// Migrate all cars from API to Firestore
export async function migrateCarsToFirestore(cars) {
    try {
        const results = [];
        let successCount = 0;
        let errorCount = 0;
        
        console.log(`Starting migration of ${cars.length} cars...`);
        
        for (const car of cars) {
            const result = await addCarToFirestore(car);
            if (result.success) {
                successCount++;
                console.log(`✅ Migrated car: ${car.make_name} ${car.name}`);
            } else {
                errorCount++;
                console.error(`❌ Failed to migrate car: ${car.make_name} ${car.name}`, result.error);
            }
            results.push(result);
            
            // Add small delay to avoid overwhelming Firestore
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`Migration complete: ${successCount} successful, ${errorCount} failed`);
        return {
            success: true,
            total: cars.length,
            successful: successCount,
            failed: errorCount,
            results: results
        };
    } catch (error) {
        console.error('Error during car migration:', error);
        return { success: false, error: error.message };
    }
}

// Cart Functions

// Add item to cart
export function addToCart(carId, carData, quantity = 1) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.carId === carId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                carId: carId,
                carData: carData,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        return { success: true, cart: cart };
    } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: error.message };
    }
}

// Remove item from cart
export function removeFromCart(carId) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.carId !== carId);
        localStorage.setItem('cart', JSON.stringify(cart));
        return { success: true, cart: cart };
    } catch (error) {
        console.error('Error removing from cart:', error);
        return { success: false, error: error.message };
    }
}

// Update cart item quantity
export function updateCartQuantity(carId, quantity) {
    try {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const item = cart.find(item => item.carId === carId);
        
        if (item) {
            if (quantity <= 0) {
                cart = cart.filter(item => item.carId !== carId);
            } else {
                item.quantity = quantity;
            }
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        return { success: true, cart: cart };
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        return { success: false, error: error.message };
    }
}

// Get cart items
export function getCartItems() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        return { success: true, cart: cart };
    } catch (error) {
        console.error('Error getting cart items:', error);
        return { success: false, error: error.message, cart: [] };
    }
}

// Clear cart
export function clearCart() {
    try {
        localStorage.removeItem('cart');
        return { success: true };
    } catch (error) {
        console.error('Error clearing cart:', error);
        return { success: false, error: error.message };
    }
}

// Get cart total
export function getCartTotal() {
    try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        let total = 0;
        let itemCount = 0;
        
        cart.forEach(item => {
            total += (item.carData.CarPrice || 0) * item.quantity;
            itemCount += item.quantity;
        });
        
        return { success: true, total: total, itemCount: itemCount };
    } catch (error) {
        console.error('Error calculating cart total:', error);
        return { success: false, error: error.message, total: 0, itemCount: 0 };
    }
}