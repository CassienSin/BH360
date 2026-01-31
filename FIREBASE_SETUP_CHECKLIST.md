# Firebase Setup Checklist & Troubleshooting

## ✅ Quick Setup Checklist

### Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **bh360-2dfd1**
3. Click **"Firestore Database"** in the left menu
4. Click **"Create database"**
5. **IMPORTANT**: Select **"Start in test mode"** (for development)
   - This allows read/write access for 30 days
   - We'll add proper security rules later
6. Choose location: **asia-southeast1** (Singapore - closest to Philippines)
7. Click **"Enable"**

### Step 2: Verify Firebase Configuration

Your `.env` file should have these values (already set):
```env
VITE_FIREBASE_API_KEY="AIzaSyAE5fUsYHr76KFpMs7Bzu40DKFCzSl08Vo"
VITE_FIREBASE_AUTH_DOMAIN="bh360-2dfd1.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="bh360-2dfd1"
VITE_FIREBASE_STORAGE_BUCKET="bh360-2dfd1.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1081040100119"
VITE_FIREBASE_APP_ID="1:1081040100119:web:a766e8f13c79d425207552"
```

### Step 3: Test Mode Security Rules

For quick testing, use these rules (Firebase Console → Firestore → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // DEVELOPMENT ONLY - Allow all reads/writes
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **WARNING**: These rules are for development ONLY. They allow anyone to read/write your database.
Replace with production rules from `FIREBASE_INTEGRATION.md` before deploying.

## 🔍 Troubleshooting Guide

### Issue: "Nothing shows up after creating incident"

**Possible Causes & Solutions:**

#### 1. Firestore Not Enabled
**Check:** 
- Open browser DevTools (F12) → Console tab
- Look for error: `"@firebase/firestore: Firestore (x.x.x): Could not reach Cloud Firestore backend"`

**Solution:**
- Enable Firestore in Firebase Console (see Step 1 above)
- Refresh your app

#### 2. Permission Denied
**Check:**
- Browser Console shows: `"FirebaseError: Missing or insufficient permissions"`

**Solution:**
- Update Firestore security rules to test mode (see Step 3 above)
- Click "Publish" in Firebase Console
- Wait 1-2 minutes for rules to propagate
- Refresh your app

#### 3. User Not Authenticated
**Check:**
- In your app, check if you're logged in
- Browser Console: `localStorage.getItem('user')`
- Should show user data

**Solution:**
- Log out and log back in
- Or clear localStorage and login again: `localStorage.clear()`

#### 4. Collection Not Created
**Check:**
- Go to Firebase Console → Firestore Database
- Look for `incidents` collection

**Solution:**
- Collections are auto-created on first write
- Try creating an incident again after fixing rules
- Manually create collection if needed:
  1. Click "Start collection"
  2. Collection ID: `incidents`
  3. Add a test document with any field
  4. Click "Save"

### Issue: "Loading spinner never stops"

**Check:**
- Browser Console for errors
- Network tab → Filter by "firestore"
- Look for failed requests

**Solution:**
1. Check internet connection
2. Verify Firebase config in `.env`
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: "Firebase configuration is incomplete"

**Check:**
- Browser Console shows this warning

**Solution:**
- Verify all Firebase environment variables in `.env`
- Make sure `.env` file is in the root directory
- Restart dev server after changing `.env`

## 🧪 Quick Test

### Test Firebase Connection

1. Open Browser DevTools (F12)
2. Go to Console tab
3. Paste this code:

```javascript
// Test Firebase initialization
const firebaseApp = window.firebase?.app();
if (firebaseApp) {
  console.log('✅ Firebase initialized:', firebaseApp.name);
  console.log('✅ Project ID:', firebaseApp.options.projectId);
} else {
  console.log('❌ Firebase not initialized');
}
```

### Test Firestore Write

1. Login to your app
2. Go to "Report New Incident"
3. Fill the form and submit
4. Open Browser DevTools → Console
5. Check for errors
6. Go to Firebase Console → Firestore
7. Check if `incidents` collection has new document

### Test Firestore Read

1. Login to your app
2. Go to Dashboard
3. Should show incident statistics
4. Go to "Incidents" page
5. Should show list of incidents

## 📝 Common Console Errors & Fixes

### Error: "No Firebase App '[DEFAULT]' has been created"
**Fix:** Restart the dev server

### Error: "Failed to get document because the client is offline"
**Fix:** 
- Check internet connection
- Clear browser cache
- Check if Firestore is enabled

### Error: "quota exceeded"
**Fix:**
- You've hit the free tier limits
- Go to Firebase Console → Usage
- Upgrade to Blaze plan or wait for quota reset

### Error: "CORS policy"
**Fix:**
- Add your domain to Firebase Console → Authentication → Settings → Authorized domains
- For localhost, it should already be authorized

## 🎯 Verification Steps

After setup, verify each of these works:

- [ ] Can create new incident (shows in Firebase Console)
- [ ] Can see incidents in Dashboard
- [ ] Can see incidents in Incidents List
- [ ] Can view incident details
- [ ] Can update incident status (if admin/tanod)
- [ ] Can delete incident (if admin)

## 📞 Still Having Issues?

1. **Clear Everything and Start Fresh:**
   ```bash
   # Stop dev server (Ctrl+C)
   # Clear browser storage
   localStorage.clear();
   sessionStorage.clear();
   
   # Clear node modules and reinstall
   rm -rf node_modules
   npm install
   
   # Restart dev server
   npm run dev
   ```

2. **Check Firebase Status:**
   - Visit: https://status.firebase.google.com/
   - Ensure all services are operational

3. **Enable Debug Mode:**
   Add to `src/config/firebase.js`:
   ```javascript
   import { enableIndexedDbPersistence } from 'firebase/firestore';
   
   // After initializing db
   if (import.meta.env.DEV) {
     enableIndexedDbPersistence(db, { synchronizeTabs: true })
       .catch(err => console.log('Persistence error:', err));
   }
   ```

## 🔐 Production Security Rules

Once testing is complete, replace test rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    match /incidents/{incidentId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn() && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

**Need more help?** Check `FIREBASE_INTEGRATION.md` for detailed documentation.
