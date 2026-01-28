# 🚀 Quick Start - Enable Login & Register

Your login and register functionality is now integrated with Firebase! Follow these 3 simple steps to activate it:

## Step 1: Create Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `BH360-K` (or any name you prefer)
4. Click **Continue** → **Continue** → **Create project**

## Step 2: Get Firebase Configuration (2 minutes)

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `BH360 Web`
3. **DO NOT check** "Firebase Hosting" checkbox
4. Click **Register app**
5. **Copy the firebaseConfig object** - you'll need these values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};
```

6. Click **Continue to console**

## Step 3: Enable Authentication & Firestore (3 minutes)

### Enable Email/Password Authentication

1. In Firebase Console sidebar, go to **Build > Authentication**
2. Click **Get started**
3. Click **Email/Password** provider
4. Enable the **Email/Password** toggle
5. Click **Save**

### Enable Firestore Database

1. Go to **Build > Firestore Database**
2. Click **Create database**
3. Select **Production mode** (you can change rules later)
4. Choose your location (closest to your users)
5. Click **Enable**

## Step 4: Configure Environment Variables (1 minute)

1. Create a `.env` file in your project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

3. Save the file

## Step 5: Restart Your Dev Server

**IMPORTANT**: Stop and restart your development server for environment variables to load:

```bash
# Stop the server (Ctrl+C in terminal)
# Then start it again:
npm run dev
```

## 🎉 You're Done!

Now you can:
- ✅ **Register** a new account at `/register`
- ✅ **Login** with your credentials at `/login`
- ✅ **Stay logged in** (Firebase handles session persistence)
- ✅ **Logout** from the user menu

## 🧪 Test Your Setup

1. Go to `http://localhost:5173/register`
2. Fill in the registration form
3. Click **Create Account**
4. Check your email for verification link (optional)
5. Go to `/login` and sign in
6. You should be redirected to `/dashboard`

## 🔍 Verify Users in Firebase

1. Go to Firebase Console
2. Navigate to **Authentication > Users** tab
3. You should see your registered user

## ⚠️ Troubleshooting

### Error: "Firebase configuration is incomplete"
- Make sure your `.env` file exists in the project root
- Check that all Firebase config values are filled in
- Restart your dev server

### Error: "Network error" or "Failed to fetch"
- Check your internet connection
- Verify Firebase project is active
- Check browser console for CORS errors

### Login/Register buttons not working
- Check browser console for errors
- Make sure Firebase Authentication is enabled
- Verify `.env` values are correct

### Users not saving to Firestore
- Check if Firestore Database is enabled
- Verify Firestore security rules allow writes
- Check browser console for permission errors

## 📚 Next Steps

- Read `FIREBASE_SETUP.md` for complete documentation
- Configure Firestore security rules (currently in test mode)
- Set up user roles and permissions
- Customize email verification templates in Firebase Console

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify all Firebase services are enabled
3. Ensure `.env` file has correct values
4. Make sure you restarted the dev server
5. Check Firebase Console for service status

---

**Note**: The `.env` file is ignored by Git (in `.gitignore`), so your Firebase credentials stay private. Never commit `.env` to version control!
