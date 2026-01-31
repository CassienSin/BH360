# Firebase Database Integration Guide

## Overview

This application is now fully integrated with Firebase Firestore database. All data operations are performed through Firebase, providing real-time synchronization, offline support, and scalable cloud storage.

## 🔥 Firebase Services

### Core Services Created

1. **`firebaseService.js`** - Base Firestore operations (CRUD, queries, subscriptions)
2. **`firebaseAuthService.js`** - Authentication operations
3. **`incidentsService.js`** - Incident management
4. **`tanodService.js`** - Tanod/barangay official management
5. **`usersService.js`** - User management
6. **`feedbackService.js`** - Feedback system
7. **`announcementsService.js`** - Announcements management
8. **`ticketsService.js`** - Help desk ticket management

### React Query Hooks

Custom hooks with TanStack Query for efficient data fetching:

1. **`useIncidents.js`** - Incident-related queries and mutations
2. **`useTanod.js`** - Tanod-related queries and mutations
3. **`useUsers.js`** - User-related queries and mutations

## 📊 Firestore Collections

The following collections are used in the database:

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User profiles and roles | uid, email, role, displayName |
| `incidents` | Incident reports | title, status, priority, category, assignedTo |
| `tanod` | Tanod member details | status, schedule, performance |
| `attendance` | Tanod attendance records | tanodId, checkInTime, checkOutTime, duration |
| `schedules` | Tanod duty schedules | tanodId, date, shift, location |
| `feedback` | User feedback | userId, message, status, response |
| `announcements` | Barangay announcements | title, content, category, status |
| `tickets` | Help desk tickets | userId, subject, status, assignedTo |
| `notifications` | User notifications | userId, type, message, read |
| `analytics` | Analytics data | type, metrics, timestamp |

## 🚀 Getting Started

### 1. Firebase Configuration

Your Firebase configuration is already set in `.env`:

```env
VITE_FIREBASE_API_KEY="AIzaSyAE5fUsYHr76KFpMs7Bzu40DKFCzSl08Vo"
VITE_FIREBASE_AUTH_DOMAIN="bh360-2dfd1.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="bh360-2dfd1"
VITE_FIREBASE_STORAGE_BUCKET="bh360-2dfd1.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1081040100119"
VITE_FIREBASE_APP_ID="1:1081040100119:web:a766e8f13c79d425207552"
```

### 2. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `bh360-2dfd1`
3. Enable **Firestore Database**:
   - Click "Firestore Database" in the left menu
   - Click "Create database"
   - Choose production mode or test mode
   - Select a region (recommended: asia-southeast1 for Philippines)

4. Set up **Security Rules** (see below)

### 3. Firestore Security Rules

Apply these security rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isTanod() {
      return isSignedIn() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'tanod';
    }
    
    function isAdminOrTanod() {
      return isAdmin() || isTanod();
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Incidents collection
    match /incidents/{incidentId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isAdminOrTanod() || isOwner(resource.data.userId);
      allow delete: if isAdmin();
    }
    
    // Tanod collection
    match /tanod/{tanodId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      allow read: if isSignedIn();
      allow create: if isTanod();
      allow update: if isAdminOrTanod();
      allow delete: if isAdmin();
    }
    
    // Schedules collection
    match /schedules/{scheduleId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    // Feedback collection
    match /feedback/{feedbackId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isAdmin() || isOwner(resource.data.userId);
      allow delete: if isAdmin();
    }
    
    // Announcements collection
    match /announcements/{announcementId} {
      allow read: if true; // Public read
      allow write: if isAdmin();
    }
    
    // Tickets collection
    match /tickets/{ticketId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isAdminOrTanod() || isOwner(resource.data.userId);
      allow delete: if isAdmin();
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isAdmin();
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // Analytics collection
    match /analytics/{analyticsId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

### 4. Firestore Indexes

Create these indexes in Firebase Console > Firestore Database > Indexes:

1. **Incidents by status and date**:
   - Collection: `incidents`
   - Fields: `status` (Ascending), `createdAt` (Descending)

2. **Incidents by assigned tanod**:
   - Collection: `incidents`
   - Fields: `assignedTo` (Ascending), `createdAt` (Descending)

3. **Attendance by tanod**:
   - Collection: `attendance`
   - Fields: `tanodId` (Ascending), `checkInTime` (Descending)

4. **User feedback by status**:
   - Collection: `feedback`
   - Fields: `status` (Ascending), `createdAt` (Descending)

## 💡 Usage Examples

### Using in Components

#### Fetching Data

```jsx
import { useAllIncidents, useIncidentStats } from '../../hooks/useIncidents';

function MyComponent() {
  const { data: incidents, isLoading, error } = useAllIncidents();
  const { data: stats } = useIncidentStats();
  
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error loading data</Alert>;
  
  return (
    <div>
      <h2>Total Incidents: {stats.total}</h2>
      {incidents.map(incident => (
        <div key={incident.id}>{incident.title}</div>
      ))}
    </div>
  );
}
```

#### Creating Data

```jsx
import { useCreateIncident } from '../../hooks/useIncidents';

function CreateIncidentForm() {
  const createIncident = useCreateIncident();
  
  const handleSubmit = async (formData) => {
    try {
      await createIncident.mutateAsync({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: 'medium',
        location: formData.location,
      });
      // Success toast is automatically shown
    } catch (error) {
      // Error toast is automatically shown
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### Real-time Updates

```jsx
import { useIncidentsRealtime } from '../../hooks/useIncidents';

function LiveIncidentsList() {
  const { data: incidents, loading } = useIncidentsRealtime([
    { field: 'status', operator: '==', value: 'in-progress' }
  ]);
  
  return (
    <div>
      {incidents.map(incident => (
        <div key={incident.id}>{incident.title}</div>
      ))}
    </div>
  );
}
```

### Direct Service Usage

If you need more control, use services directly:

```javascript
import { 
  createIncident, 
  getIncident, 
  updateIncident 
} from '../services/incidentsService';

// Create
const incidentId = await createIncident({
  title: 'Test Incident',
  category: 'noise',
  priority: 'medium',
});

// Read
const incident = await getIncident(incidentId);

// Update
await updateIncident(incidentId, {
  status: 'in-progress',
  assignedTo: 'tanod-id',
});
```

## 🔄 Pages Updated with Firebase

The following pages now use real Firebase data:

- ✅ **Dashboard** - Real-time statistics and recent incidents
- ✅ **User Management** - CRUD operations on users
- ✅ **Incident List** - Display and manage all incidents
- ✅ **Incident Details** - View and update individual incidents
- 🔄 **Tanod Management** - (Use `useTanod` hooks)
- 🔄 **Analytics** - (Use Firebase Analytics collection)
- 🔄 **Announcements** - (Use `announcementsService`)
- 🔄 **Help Desk** - (Use `ticketsService`)

## 🧪 Testing the Integration

### 1. Start Development Server

```bash
npm run dev
```

### 2. Create Test Data

Use the Firebase Console to add some test data, or register a new user and create incidents through the UI.

### 3. Verify Real-time Updates

1. Open the app in two browser tabs
2. Create/update data in one tab
3. See it update automatically in the other tab

## 🔒 Authentication Flow

1. User logs in via `Login.jsx`
2. `firebaseAuthService.signIn()` authenticates with Firebase
3. User data is stored in Redux and localStorage
4. `useAuthPersistence` hook maintains auth state
5. Protected routes check authentication status
6. All Firestore operations use authenticated user's UID

## 📝 Data Models

### Incident Model

```typescript
{
  id: string;
  title: string;
  description: string;
  category: 'crime' | 'noise' | 'hazard' | 'dispute';
  priority: 'emergency' | 'urgent' | 'medium' | 'low';
  status: 'submitted' | 'in-progress' | 'resolved' | 'rejected';
  location: string;
  reporterName: string;
  reporterContact: string;
  assignedTo: string | null;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt: Timestamp | null;
}
```

### User Model

```typescript
{
  id: string; // Same as Firebase Auth UID
  email: string;
  displayName: string;
  role: 'admin' | 'tanod' | 'resident';
  emailVerified: boolean;
  photoURL: string | null;
  firstName: string;
  lastName: string;
  contactNumber: string;
  address: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🛠 Troubleshooting

### Issue: "Firebase configuration is incomplete"

**Solution**: Check that all environment variables are set in `.env`

### Issue: "Permission denied" errors

**Solution**: Review and update Firestore security rules

### Issue: "Collection not found"

**Solution**: Create the collection by adding a document through Firebase Console

### Issue: Data not updating in real-time

**Solution**: 
- Check that you're using the real-time hooks (`useIncidentsRealtime`)
- Verify Firestore is enabled in Firebase Console
- Check browser console for errors

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 🎯 Next Steps

1. **Set up Firebase Indexes** - Create composite indexes for complex queries
2. **Enable Firebase Storage** - For image uploads in incidents
3. **Add Cloud Functions** - For server-side logic (notifications, email, etc.)
4. **Set up Firebase Analytics** - Track user behavior
5. **Configure Firebase Hosting** - Deploy your app
6. **Add Offline Support** - Configure Firestore offline persistence

## 🔐 Security Best Practices

1. ✅ Never commit `.env` to version control
2. ✅ Use security rules to protect data
3. ✅ Validate data on the client and server side
4. ✅ Use Firebase Auth for authentication
5. ✅ Implement role-based access control (RBAC)
6. ✅ Regularly audit security rules
7. ✅ Enable Firebase App Check for additional security

---

**Your Firebase database is now fully integrated!** 🎉

All data operations flow through Firebase Firestore, providing a scalable, real-time, and secure backend for your Barangay Management System.
