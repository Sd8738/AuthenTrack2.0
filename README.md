# 📱 AuthenTrack – Smart Attendance Management System

**AuthenTrack** is a modern attendance management solution designed to make student attendance marking **secure, transparent, and proxy-free**.  
Built as a **Progressive Web App (PWA)** and deployable as an **Android app**, AuthenTrack leverages **Firebase**, **React**, and **real-time technologies** to simplify classroom management for students, teachers, and HODs.

---

## 🎯 Project Overview

Traditional attendance systems are prone to **proxies and inefficiency**.  
AuthenTrack solves this by introducing a **digital attendance platform** that verifies student identity through **webcam capture, location tracking, and secure records**.  

It provides **role-based dashboards** for:
- 🎓 Students  
- 👩‍🏫 Teachers  
- 🏫 Heads of Department (HOD)

Each role has unique access and control features that ensure smooth, accurate, and real-time attendance tracking.

---

## ✨ Key Features

### 🔹 Common Features
- Secure **login with Name and Registered Phone Number**
- Clean and responsive **Progressive Web App** interface
- Compatible across **mobile, tablet, and desktop**
- Real-time data sync using **Firebase Firestore**
- **Offline-ready PWA** with installable app support

---

### 🎓 Student Features
- Register easily with **Full Name, PRN, Phone, Email, Class, Department, and Division**
- View assigned lectures and attendance history  
- Mark attendance through **webcam verification** and **location capture**
- Get automatic feedback on attendance submission

---

### 👩‍🏫 Teacher Features
- Create and manage **lecture sessions** for classes/divisions  
- Enable or disable attendance marking for specific sessions  
- Monitor students marking attendance in real-time  
- View, update, and analyze attendance reports with **interactive charts**
- Manage assigned classes and divisions with full control

---

### 🏫 HOD (Head of Department) Features
- Manage **departments, teachers, and students**
- View consolidated department-level attendance analytics  
- Register new teachers or remove inactive ones  
- Departmental oversight for **academic transparency**

---

## ⚙️ Technology Stack

| Category | Technology Used |
|-----------|-----------------|
| **Frontend** | React.js (with React Router & Hooks) |
| **Backend / Database** | Firebase Firestore |
| **Authentication** | Custom name & phone-based login (Firestore lookup) |
| **Hosting** | Vercel (PWA-ready deployment) |
| **App Build** | Converted to Android using Trusted Web Activity (TWA) |
| **Charts & Visualization** | Recharts.js |
| **Webcam Integration** | React-Webcam library |
| **Location Access** | Browser Geolocation API |
| **UI Styling** | HTML5, CSS3, and Tailwind/Vanilla CSS |
| **PWA Features** | Service Worker, Manifest, Install Prompt |

---

## 🧩 System Architecture Overview

      ┌────────────────────────┐
      │        FRONTEND        │
      │   React.js + Firebase  │
      │ (Web + PWA + Android)  │
      └──────────┬─────────────┘
                 │
                 ▼
      ┌────────────────────────┐
      │     FIREBASE CLOUD     │
      │  Firestore Database    │
      │  Storage (Snapshots)   │
      │  Hosting + Analytics   │
      └──────────┬─────────────┘
                 │
                 ▼
      ┌────────────────────────┐
      │     USER ROLES         │
      │  • Student Dashboard   │
      │  • Teacher Dashboard   │
      │  • HOD Dashboard       │
      └────────────────────────┘

---

## 📊 Core Collections in Firestore

- `students` → Stores student details and metadata  
- `teachers` → Teacher profiles, assigned classes/divisions  
- `hods` → Department heads and admin privileges  
- `attendance` → Attendance records (with timestamps, location & photo)  
- `departments` → Department-level data for management

---

## 📍 Key Highlights

- 🔒 **Anti-proxy mechanism:** Real-time image & location verification  
- ⚡ **Serverless architecture:** Entire backend runs on Firebase  
- 💡 **Cross-platform:** Works as a website, PWA, and Android app  
- 🌐 **Real-time updates:** Instant data sync via Firestore listeners  
- 📱 **Minimal input:** Simple and efficient UI for fast attendance  

---

## 🚀 Future Enhancements

- ✅ Integration with **Firebase Phone Authentication**  
- ✅ Admin analytics dashboard with exportable attendance reports  
- ✅ Enhanced **AI face recognition** for attendance verification  
- ✅ Push notifications for attendance reminders and updates  

---

## 💼 Impact

AuthenTrack eliminates manual attendance hassles, promotes transparency, and prevents proxy attendance effectively.  
It’s designed for **colleges, universities, and institutions** aiming to digitize and secure their academic processes.

---

## 🧑‍💻 Developed By

**Team AuthenTrack**  
Built with ❤️ using **React**, **Firebase**, and **Progressive Web App technologies**.

---

## 📸 App Preview

Example:
Screenshots 
![image](https://i.postimg.cc/htSVwWQM/Screenshot-89.png)
![image](https://i.postimg.cc/YCsjxJ66/Screenshot-90.png)
![image](https://i.postimg.cc/HLMW9jsD/Screenshot-91.png)
![image](https://i.postimg.cc/s25yZ8w2/Screenshot-92.png)
