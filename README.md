# AuthenTrack 2.0

**AuthenTrack** is a Progressive Web App (PWA) for managing student attendance with anti-proxy features: webcam capture, location capture, role-based dashboards (Student, Teacher, HOD), and realtime storage in Firebase Firestore. This repository contains a React app (Create React App) configured as a PWA and designed for deployment to static hosts such as Vercel.

---

## Table of contents

* [Project overview](#project-overview)
* [Key features](#key-features)
* [Tech stack](#tech-stack)
* [Project structure](#project-structure)
* [Firestore data model](#firestore-data-model)
* [Setup & local development](#setup--local-development)
* [Firebase configuration](#firebase-configuration)
* [Build & deployment (Vercel)](#build--deployment-vercel)
* [PWA notes](#pwa-notes)
* [Testing and troubleshooting](#testing-and-troubleshooting)
* [Known issues & recommendations](#known-issues--recommendations)
* [Contributing](#contributing)
* [License](#license)

---
Screenshots 
![image](https://i.postimg.cc/htSVwWQM/Screenshot-89.png)
![image](https://i.postimg.cc/YCsjxJ66/Screenshot-90.png)
![image](https://i.postimg.cc/HLMW9jsD/Screenshot-91.png)
![image](https://i.postimg.cc/s25yZ8w2/Screenshot-92.png)

---

## Project overview

AuthenTrack 2.0 provides role-based attendance management:

* **Students** can register / login and mark attendance when a teacher opens an attendance session. Attendance capture uses webcam snapshots and (optional) geolocation.
* **Teachers** can enable/disable attendance, create lectures/sessions, view attendance records and simple analytics (recharts), and manage assigned classes/divisions.
* **HODs** (Head of Department) can manage teachers, students, departments and basic metadata.

The app uses Firestore as the backend (no custom server required) and ships as a PWA with a service worker and manifest.

---

## Key features

* Role selection (Student / Teacher / HOD).
* Registration forms specialized per-role (students collect PRN, class, division; teachers collect assigned classes/divisions; HODs manage departments).
* Login by **name + phone number** (no password flow) — matching documents in Firestore collections.
* Attendance marking includes a webcam snapshot and timestamp; optionally records the browser's geolocation (if permitted).
* Teacher dashboard shows attendance controls and graphs (uses `recharts`).
* HOD dashboard for CRUD operations over teachers and students.
* PWA: `manifest.json`, `service-worker.js` and a small `InstallPWA` helper component.

---

## Tech stack

* React (Create React App)
* React Router v6
* Firebase (Firestore) SDK v10
* react-webcam (for capturing images)
* recharts (simple charts)
* Vanilla CSS + component-level styles

---

## Project structure (important files)

```
/public
  ├─ index.html
  ├─ manifest.json
  └─ service-worker.js
/src
  ├─ App.js                 # Routes + ProtectedRoute wrapper
  ├─ firebase.js            # Firebase initialization (currently contains config)
  ├─ index.js
  ├─ App.css
  └─ components/
      ├─ RoleSelection.js
      ├─ Registration.js
      ├─ Login.js
      ├─ StudentDashboard.js
      ├─ TeacherDashboard.js
      ├─ HODDashboard.js
      └─ InstallPWA.js
package.json
vercel.json
```

---

## Firestore data model

The app uses the following Firestore collections (observed in source code):

* `students` — student documents. Fields used include: `name`, `phone`, `email`, `prn`, `class`, `division`, `department`, `addedAt`, etc.
* `teachers` — teacher documents. Fields: `name`, `phone`, `email`, `subject`, `department`, `assignedClasses`, `assignedDivisions`, `attendanceEnabled`, `currentLecture`, `addedBy`, `addedAt`, etc.
* `hods` — HOD user documents (department-level metadata and admin permissions).
* `attendance` — attendance records. Typical fields: `studentId`, `teacherId`, `lectureNumber` or `lecture`, `timestamp`/`addedAt`, `photo` (webcam snapshot data URI), `location` (if recorded), and any other metadata.
* `departments` — department definitions (used by HOD dashboard).

> Note: This README documents the shape observed in the code. Adjust Firestore fields and security rules to match your production needs.

---

## Setup & local development

1. Clone the repo and install dependencies:

```bash
git clone <your-repo-url>
cd AuthenTrack2.0-main
npm install
```

2. Configure Firebase (see next section).

3. Run the dev server:

```bash
npm start
```

This runs the Create React App development server ([http://localhost:3000](http://localhost:3000)).

---

## Firebase configuration

Currently the repo contains an inline `firebaseConfig` in `src/firebase.js`. For security and flexibility you should move this to environment variables. Example recommended approach:

1. Create a Firebase project in the Firebase Console.
2. Enable Firestore and create the collections described above.
3. Update `src/firebase.js` to read configuration from environment variables OR replace the placeholder config with your project's config.

**Using environment variables (recommended):**

* Create a `.env` file in the project root with `REACT_APP_FIREBASE_API_KEY` and other keys:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_FIREBASE_MEASUREMENT_ID=...
```

* Modify `src/firebase.js` to use `process.env.REACT_APP_*` variables. Example:

```js
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
```

**Firestore rules:**

This app currently uses Firestore client SDK directly. In production you must define appropriate security rules to prevent unauthorized reads/writes. Example minimal rules (NOT production-ready):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{doc} {
      allow read, write: if request.auth != null; // adjust per-role
    }
    // tighten rules for teachers, attendance and hods
  }
}
```

---

## Build & deployment (Vercel)

This repo includes a `vercel.json`. To deploy to Vercel:

1. Push the repository to GitHub.
2. In Vercel, import the GitHub repository.
3. Set the build command (default Create React App): `npm run build` and output directory: `build`.
4. Add any environment variables (Firebase keys) in the Vercel Project Settings.

**Special note:** `package.json` runs `npm run copy-sw` after build to copy `public/service-worker.js` into `build/` so the PWA service worker is deployed.

---

## PWA notes

* `public/manifest.json` and `public/service-worker.js` are included. The app includes an `InstallPWA` component that listens to `beforeinstallprompt` and shows an install button when available.
* The PWA will prompt users to install on supporting browsers. The service worker is a custom `service-worker.js` — review and adapt it for cache strategy and offline behavior.

---

## Testing and troubleshooting

**Common checks**

* Ensure Firestore collections exist: `students`, `teachers`, `attendance`, `hods`, `departments`.
* Make sure documents are created in these collections (register users from the UI).
* Login is performed by querying Firestore for a document with matching `name` and `phone`. If login fails for HOD or Teacher, verify that a document with the provided name and phone exists in the corresponding collection.
* Browser permissions: attendance uses webcam (via `react-webcam`) and optionally geolocation. Ensure the browser has permissions enabled.

**Debugging login issues**

* If HOD login fails: check that the HOD is registered (in `hods`) with exact `name` and `phone` fields, and that you selected the `HOD` role in RoleSelection before attempting login.
* If teacher login fails: same: check the `teachers` collection.

**Console logs**

Open browser devtools console to inspect logs and any Firestore/network errors.

---

## Known issues & recommendations

1. **Credentials in source**: The repo currently includes `src/firebase.js` with config values. Move these to environment variables and remove the keys from source control.
2. **Auth model**: Authentication is name+phone matching in Firestore — this is not secure. If you intend to use the app in production, consider using Firebase Authentication (phone auth or email/password) and storing minimal user profiles in Firestore.
3. **Security rules**: Firestore rules must be implemented to restrict reads/writes by role.
4. **Image storage**: Currently webcam snapshots may be stored in attendance documents (data URIs). For production, consider uploading photos to Firebase Storage and store URLs in Firestore to avoid large document sizes.
5. **Offline and sync**: PWA offline behavior depends on the provided `service-worker.js`. Review caching strategy for dynamic Firestore data.

If you want, I can make these improvements: move Firebase config to env vars, add phone-based Firebase Auth, or migrate snapshots to Firebase Storage.

---

## Contributing

1. Fork the repository
2. Create a feature branch `feature/your-feature`
3. Commit your changes and push
4. Open a pull request with details of the change

Please open issues for bugs and feature requests.

---

## License

This project is provided under the MIT License. (Add a `LICENSE` file if desired.)

---

### Credits

Built with ❤️ using React + Firebase. If you want a polished README with screenshots, CI steps, or sample data that populates Firestore collections automatically, tell me and I will add them.
