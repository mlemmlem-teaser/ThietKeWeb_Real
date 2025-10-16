# Firebase Setup Instructions

## OAuth Domain Authorization Issue Fix

The error you're seeing in the console:
```
The current domain is not authorized for OAuth operations. This will prevent signInWithPopup, signInWithRedirect, linkWithPopup and linkWithRedirect from working. Add your domain (127.0.0.1) to the OAuth redirect domains list in the Firebase console.
```

### How to Fix:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `car-management-477e4`
3. **Navigate to Authentication**:
   - Click on "Authentication" in the left sidebar
   - Click on "Settings" tab
   - Click on "Authorized domains" tab

4. **Add these domains**:
   - `localhost`
   - `127.0.0.1`
   - `http://localhost` (if needed)
   - `http://127.0.0.1` (if needed)
   - Any other local development domains you use

5. **Click "Add domain"** for each one

### Additional Setup:

#### Enable Authentication Methods:
1. Go to **Authentication > Sign-in method**
2. Enable **Email/Password** authentication
3. Save changes

#### Firestore Security Rules:
Make sure your Firestore rules in the Firebase Console match the ones in your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true; 
      allow create, update, delete: if
        request.auth != null
        && resource.data.status.role == "admin"
        && resource.data.status.active == true;
    }

    match /cars/{carId} {
      allow read: if true;
      allow create, update, delete: if
        request.auth != null
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status.role == "admin"
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status.active == true;
    }
  }
}
```

### Testing:
After adding the domains, try:
1. Refresh your admin page
2. Clear browser cache if needed
3. The OAuth error should disappear

### Development Server:
If you're using a development server (like Live Server, http-server, etc.), also add:
- `localhost:3000` (or whatever port you're using)
- `127.0.0.1:3000` (or whatever port you're using)

The system will now work properly with Firebase authentication on localhost!
