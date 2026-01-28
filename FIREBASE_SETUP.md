# Firebase Setup Guide

This guide will help you integrate Firebase into your Barangay Help 360 application.

## 📋 Prerequisites

- Node.js and npm installed
- A Google account
- Firebase CLI (optional, for emulators)

## 🚀 Getting Started

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter your project name (e.g., "BH360-K")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### Step 2: Register Your Web App

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Register your app with a nickname (e.g., "BH360 Web")
3. **Copy the Firebase configuration** object - you'll need this next
4. Click "Continue to console"

### Step 3: Configure Environment Variables

1. Copy `.env.example` to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the Firebase values with your configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

3. Save the file

### Step 4: Enable Firebase Services

#### Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Production mode** (you can change rules later)
4. Select your preferred location
5. Click "Enable"

#### Authentication (Optional)

1. Go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Save changes

#### Storage (Optional)

1. Go to **Build > Storage**
2. Click "Get started"
3. Start in **Production mode**
4. Choose your storage location
5. Click "Done"

### Step 5: Configure Firestore Security Rules

1. Go to **Firestore Database > Rules**
2. Replace with the following rules (adjust based on your needs):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function hasRole(role) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId) || hasRole('admin');
      allow delete: if hasRole('admin');
    }
    
    // Incidents collection
    match /incidents/{incidentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if hasRole('admin') || hasRole('tanod');
      allow delete: if hasRole('admin');
    }
    
    // Tanod collection
    match /tanod/{tanodId} {
      allow read: if isAuthenticated();
      allow write: if hasRole('admin');
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated();
      allow create: if hasRole('tanod') || hasRole('admin');
      allow update: if hasRole('admin');
      allow delete: if hasRole('admin');
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if hasRole('admin');
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if hasRole('admin');
    }
    
    // Feedback collection
    match /feedback/{feedbackId} {
      allow read: if hasRole('admin');
      allow create: if isAuthenticated();
      allow update: if hasRole('admin');
      allow delete: if hasRole('admin');
    }
    
    // Default: deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click "Publish"

## 📦 Using Firebase in Your Code

### Import Firebase Services

```javascript
import { db, auth, storage } from './config/firebase';
import { 
  createDocument, 
  getDocument, 
  updateDocument,
  COLLECTIONS 
} from './services/firebaseService';
```

### Basic CRUD Operations

#### Create a Document

```javascript
import { useCreateDocument } from './hooks/useFirestore';
import { COLLECTIONS } from './services/firebaseService';

function MyComponent() {
  const createIncident = useCreateDocument(COLLECTIONS.INCIDENTS);
  
  const handleSubmit = async (data) => {
    try {
      const docId = await createIncident.mutateAsync(data);
      console.log('Created incident:', docId);
    } catch (error) {
      console.error('Error:', error);
    }
  };
}
```

#### Read a Document

```javascript
import { useDocument } from './hooks/useFirestore';
import { COLLECTIONS } from './services/firebaseService';

function IncidentDetails({ incidentId }) {
  const { data, loading, error } = useDocument(COLLECTIONS.INCIDENTS, incidentId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data.title}</div>;
}
```

#### Update a Document

```javascript
import { useUpdateDocument } from './hooks/useFirestore';

function UpdateIncident({ incidentId }) {
  const updateIncident = useUpdateDocument(COLLECTIONS.INCIDENTS);
  
  const handleUpdate = async () => {
    await updateIncident.mutateAsync({
      docId: incidentId,
      data: { status: 'resolved' }
    });
  };
}
```

#### Real-time Updates

```javascript
import { useDocumentRealtime } from './hooks/useFirestore';

function LiveIncident({ incidentId }) {
  const { data, loading } = useDocumentRealtime(COLLECTIONS.INCIDENTS, incidentId);
  
  // Component automatically updates when document changes in Firestore
  return <div>{data?.status}</div>;
}
```

### Query Documents

```javascript
import { queryDocuments } from './services/firebaseService';

// Get all pending incidents
const pendingIncidents = await queryDocuments(
  COLLECTIONS.INCIDENTS,
  [{ field: 'status', operator: '==', value: 'pending' }],
  { orderBy: { field: 'createdAt', direction: 'desc' }, limit: 10 }
);
```

## 🔐 Firebase Authentication Integration

### Sign In

```javascript
import { signIn } from './services/firebaseAuthService';

const handleLogin = async (email, password) => {
  try {
    const user = await signIn(email, password);
    console.log('Logged in:', user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Register

```javascript
import { register } from './services/firebaseAuthService';

const handleRegister = async (email, password, userData) => {
  try {
    const user = await register(email, password, {
      fullName: userData.fullName,
      role: 'resident',
      ...userData
    });
    console.log('Registered:', user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Auth State Listener

```javascript
import { subscribeToAuthState } from './services/firebaseAuthService';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user) => {
      if (user) {
        console.log('User logged in:', user);
        // Update Redux store
      } else {
        console.log('User logged out');
      }
    });
    
    return () => unsubscribe();
  }, []);
}
```

## 🧪 Local Development with Emulators (Optional)

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase in Your Project

```bash
firebase init
```

Select:
- Firestore
- Emulators

### Start Emulators

```bash
firebase emulators:start
```

### Update `.env` for Emulators

```env
VITE_USE_FIREBASE_EMULATORS=true
```

## 📊 Collection Structure

### Users Collection
```javascript
{
  email: string,
  fullName: string,
  role: 'admin' | 'tanod' | 'resident',
  phone: string,
  address: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Incidents Collection
```javascript
{
  title: string,
  description: string,
  category: string,
  priority: string,
  status: 'pending' | 'in-progress' | 'resolved',
  location: string,
  reporterId: string,
  assignedTo: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Tanod Collection
```javascript
{
  userId: string,
  fullName: string,
  badgeNumber: string,
  status: 'active' | 'inactive',
  assignedArea: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎯 Best Practices

1. **Always validate data** before writing to Firestore
2. **Use transactions** for operations that need to be atomic
3. **Implement proper security rules** for production
4. **Use indexed queries** for better performance
5. **Batch writes** when updating multiple documents
6. **Monitor usage** in Firebase Console to avoid quota limits
7. **Use environment variables** - never commit Firebase config to version control

## 🔍 Troubleshooting

### Error: Firebase not initialized
- Check that `.env` file exists and has correct values
- Verify Firebase config in `src/config/firebase.js`

### Permission Denied
- Check Firestore security rules
- Verify user authentication status
- Ensure user has correct role/permissions

### Real-time updates not working
- Check internet connection
- Verify Firestore rules allow read access
- Check browser console for errors

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)

## 🤝 Support

If you encounter any issues, please check:
1. Firebase Console for any configuration issues
2. Browser console for error messages
3. Network tab to verify Firebase requests
4. Firestore security rules for permission issues




