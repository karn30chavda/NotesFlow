# 📝 NotesFlow

A modern, feature-rich  NotesFlow web app that lets users create, manage, and organize notes with a clean and intuitive interface.

---

## ✨ Features

### 🔐 Authentication & User Management
- Secure email/password login system
- User registration with strong password validation
- Password reset functionality
- Profile picture upload via Cloudinary
- Persistent login sessions

### 🗒️ Note Management
- Create, read, update, delete (CRUD) notes
- Rich text editing
- Automatic timestamps
- Lock notes with PIN
- Real-time saving

### 🔍 Search & Organization
- Search notes by title
- Filter notes by date (with Flatpickr)
- Date picker & clear filter option
- Chronological note ordering

### 🎨 User Interface
- Fully responsive design
- Dark/Light theme toggle (saved in localStorage)
- Smooth animations & transitions
- Scroll-to-top feature
- Material Design icons
- Empty states and loading/error handling

### 🛡️ Security
- Firebase Auth with protected routes
- PIN lock for sensitive notes
- Secure password requirements
- Safe deletion confirmations

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3 (Flexbox/Grid)
- Vanilla JavaScript
- Font Awesome Icons
- Flatpickr Date Picker

### Backend / Services
- Firebase Auth
- Firebase Firestore
- Cloudinary for images
- Real-time sync with Firestore

---

## 🚀 Installation & Setup

1. **Clone the repo: 
   git clone https://github.com/karn30chavda/STICKY-NOTE-PROJECT

2. Setup Firebase:

Create a Firebase project
Enable Email/Password auth
Create a Firestore DB
Update your Firebase config in index.js


3. Setup Cloudinary:

Create an account
Add your upload preset and API details in index.js


4. Install External Dependencies: Add these to your index.html:

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">


5. Run Locally:
Use a live server extension or lite-server to launch the app.


---

🌐 Live Demo

🔗 Netlify: https://notesflowapp.netlify.app


---

📘 Usage Guide

Getting Started

Click GET STARTED to open auth modal

Sign up or log in with email/password

Optionally upload a profile pic


Notes

Click Add Note to create one

Use title + rich text editor

Save with 💾 icon

Lock notes with 🔒 and PIN

Edit/delete as needed


Searching & Filtering

Search bar for titles

Calendar icon to pick date

Clear filters with ✖️ icon


Customization

Dark/light mode toggle

Update profile picture

Filter notes by title/date



---

🔒 Security Considerations

Strong password policy

PIN protection on notes

Secure Firestore rules

Image upload safety

Auth route protection



---

🌍 Browser Support

✅ Chrome (latest)

✅ Firefox (latest)

✅ Safari (latest)

✅ Edge (latest)

📱 Fully mobile-responsive



---

🤝 Contributing

1. Fork the repo


2. Create a new feature branch


3. Commit and push changes


4. Open a Pull Request




---

📄 License

MIT License - See LICENSE file for details.


---

📧 Contact

📩 Email: karanchavda543@gmail.com

🐙 GitHub: @karn30chavda



---
