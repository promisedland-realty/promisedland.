# 🏡 Promised Land — Setup Guide

## Files
```
index.html   ← Main website
style.css    ← All styles
app.js       ← JS logic + Firebase integration
README.md    ← This file
```

---

## 🚀 Running Locally (No backend needed)
Just open `index.html` in any browser.  
The site works in **demo mode** with seed properties until Firebase is set up.

---

## 🔥 Connecting Firebase (Free Backend — 5 minutes)

### Step 1 — Create Firebase Project
1. Go to → https://console.firebase.google.com
2. Click **Add Project** → give it a name (e.g. `promised-land`)
3. Disable Google Analytics if you like → **Create Project**

### Step 2 — Enable Firestore
1. In left sidebar → **Build → Firestore Database**
2. Click **Create database** → Choose **Production mode** → Pick `asia-south1` (Mumbai)
3. Done!

### Step 3 — Add Web App
1. In Firebase console → Project Settings (gear icon) → **Add App** → Web `</>`
2. Give it a name → click **Register App**
3. Copy the `firebaseConfig` values shown

### Step 4 — Paste Config in app.js
Open `app.js` and replace the top section:

```javascript
const FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

### Step 5 — Set Firestore Rules
In Firebase Console → Firestore → **Rules**, paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can submit a property
    match /properties/{id} {
      allow create: if true;
      // Only approved ones are readable
      allow read: if resource.data.status == 'approved';
    }
  }
}
```

Click **Publish**.

---

## ✅ Approving Listings
When someone submits a property, it's saved with `status: "pending"`.

To approve it:
1. Go to Firebase Console → Firestore → `properties` collection
2. Click the listing → Edit `status` field → change to `"approved"`
3. It instantly appears on the website!

> 💡 **Later enhancement**: Add a simple Firebase Admin panel (also free) to approve from a dashboard.

---

## 🌐 Free Hosting Options
| Option | Command |
|--------|---------|
| **Firebase Hosting** | `firebase deploy` (run once after `firebase init`) |
| **Netlify** | Drag & drop the folder at netlify.com |
| **GitHub Pages** | Push to GitHub → enable Pages in settings |

---

## 📦 Free Tools Used
- **Firebase Firestore** — database (free tier: 1GB storage, 50k reads/day)
- **Firebase Hosting** — (optional) free SSL + CDN
- **Google Fonts** — Playfair Display + DM Sans
- **WhatsApp API** — free wa.me links
- **Imgur** — free image hosting for property photos

---

## 📞 Contact
RERA Email: rera.promizedland@gmail.com  
Phone: +91 90805 81547
