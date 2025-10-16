# 🚗 Car Management System

A comprehensive web application for managing car inventory, users, and administrative functions with Firebase integration.

## 🌟 Features

### 🔐 Authentication System
- **User Registration & Login** - Secure authentication with Firebase
- **Role-based Access** - Separate user and admin roles
- **Session Management** - Persistent login sessions

### 👥 User Management
- **User Registration** - Complete user profile creation
- **Admin Panel** - Manage users and their roles
- **User Search & Filtering** - Find users quickly

### 🚗 Car Management
- **Car Inventory** - Add, edit, and delete cars
- **Car Listing** - Browse cars with search and filters
- **Status Tracking** - Available, Sold, Maintenance statuses
- **Image Placeholders** - Fallback images for all car listings

### 📊 Admin Dashboard
- **Statistics Overview** - Total cars, users, and admins
- **Quick Actions** - Easy access to management functions
- **Recent Activity** - Track system usage

### 🎨 Design & UI
- **Black/White High Contrast Theme** - Accessible design
- **Responsive Layout** - Works on all devices
- **Clean & Simple Interface** - Easy to use for beginners
- **Global Components** - Consistent navbar, sidebar, and footer

## 🏗️ Project Structure

```
BTL/
├── Assets/
│   ├── image/          # Image placeholders and assets
│   ├── icon/           # Icon files
│   ├── font/           # Font files
│   └── video/          # Video assets
├── src/
│   ├── admin/          # Admin panel pages
│   │   ├── dashboard/  # Admin dashboard
│   │   ├── manage-user/    # User management
│   │   └── manage-admin/   # Admin management
│   └── client/         # Client-side pages
│       ├── login-register/ # Authentication pages
│       ├── product/        # Car listing page
│       ├── components/     # Global components
│       └── api/           # Firebase API functions
├── config-firebase.js  # Firebase configuration
├── global-style.css    # Global styles and theme
├── variable.css        # CSS variables
└── index.html         # Home page
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Firebase project setup
- Web server (for local development)

### Installation

1. **Clone or download the project**
2. **Set up Firebase:**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `config-firebase.js` with your Firebase config

3. **Start a local server:**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:8000`
   - Register a new account or login

## 📱 Pages Overview

### 🏠 Home Page (`index.html`)
- Hero section with call-to-action
- Feature highlights
- Navigation to other sections

### 🔐 Authentication (`src/client/login-register/`)
- **Login Page** - User authentication
- **Register Page** - New user registration
- Form validation and error handling

### 🚗 Car Listing (`src/client/product/`)
- Browse all available cars
- Search by make, model, or year
- Filter by price range
- Responsive card layout

### 👑 Admin Dashboard (`src/admin/dashboard/`)
- Statistics overview
- Quick action buttons
- Recent cars table
- Add new car functionality

### 👥 User Management (`src/admin/manage-user/`)
- View all registered users
- Search and filter users
- Edit user information
- Role management

### 🔧 Admin Management (`src/admin/manage-admin/`)
- Manage administrator accounts
- Add new admins
- Edit admin profiles
- Admin statistics

## 🎨 Design System

### Color Scheme
- **Primary**: Black (#000000)
- **Background**: White (#ffffff)
- **Text**: Black (#000000)
- **Borders**: Light Gray (#cccccc)
- **High Contrast**: Ensures accessibility

### Typography
- **Font Family**: System fonts (Arial, sans-serif)
- **Headings**: Bold, high contrast
- **Body Text**: Readable, 1.6 line height

### Components
- **Buttons**: Clear borders, hover effects
- **Forms**: Consistent styling, validation
- **Cards**: Subtle shadows, hover animations
- **Tables**: Clean borders, responsive design

## 🔧 Technical Details

### Firebase Integration
- **Authentication**: Email/password login
- **Firestore**: User and car data storage
- **Real-time Updates**: Live data synchronization

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: 768px, 480px
- **Flexible Grid**: CSS Grid and Flexbox

### Code Organization
- **Modular JavaScript**: Separate files for each page
- **CSS Variables**: Consistent theming
- **Component-based**: Reusable UI components

## 📝 File Descriptions

### Core Files
- `config-firebase.js` - Firebase configuration and exports
- `global-style.css` - Global styles and component styles
- `variable.css` - CSS custom properties for theming

### Component Files
- `src/client/components/components.js` - Global navbar, sidebar, footer
- `src/client/api/firebase.js` - Firebase API functions

### Page Files
Each page has three files:
- `.html` - Page structure
- `.css` - Page-specific styles
- `.js` - Page functionality

## 🚀 Features Implementation

### ✅ Completed Features
- [x] User authentication (login/register)
- [x] Admin dashboard with statistics
- [x] User management system
- [x] Admin management system
- [x] Car listing and search
- [x] Responsive design
- [x] High contrast theme
- [x] Global components
- [x] Firebase integration

### 🔄 Future Enhancements
- [ ] Car details page
- [ ] Contact form functionality
- [ ] Image upload system
- [ ] Advanced search filters
- [ ] Email notifications
- [ ] Data export features

## 🛠️ Development Notes

### Code Style
- **Clean Code**: Easy to understand for beginners
- **Comments**: Short explanations for each section
- **Consistent Naming**: Clear variable and function names
- **Modular Structure**: Separate concerns

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features
- CSS Grid and Flexbox

### Performance
- Optimized images with placeholders
- Minimal external dependencies
- Efficient Firebase queries

## 📞 Support

This project is designed to be beginner-friendly with:
- Clear code comments
- Simple structure
- Consistent patterns
- Comprehensive documentation

For questions or issues, refer to the code comments or this README file.

---

**Built with ❤️ for learning and development**
