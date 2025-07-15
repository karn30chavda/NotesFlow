import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCa6NZ9lG0g98vWl1iQCM6ovbXDiivTX2g",
  authDomain: "sticky-notes-65cf4.firebaseapp.com",
  databaseURL: "https://sticky-notes-65cf4-default-rtdb.firebaseio.com",
  projectId: "sticky-notes-65cf4",
  storageBucket: "sticky-notes-65cf4.appspot.com",
  messagingSenderId: "553422297292",
  appId: "1:553422297292:web:2938b1b8a54df5dd310a69",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const addBtn = document.querySelector("#addBtn");
const loginBtn = document.querySelector("#loginBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const main = document.querySelector("#main");
const loginModal = document.querySelector("#loginModal");
const closeModal = document.querySelector(".close");
const signupLink = document.querySelector("#signupLink");
const loginLink = document.querySelector("#loginLink");
const authForm = document.querySelector("#authForm");
const signupForm = document.querySelector("#signupForm");
const loginForm = document.querySelector("#loginForm");
const welcomeSection = document.querySelector("#welcomeSection");
const themeToggle = document.querySelector("#themeToggle");
const admin_icon = document.querySelector("#admin-icon");
const userProfileImage = document.getElementById("userProfileImage");
const searchContainer = document.getElementById("searchContainer");
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
const body = document.body;

// Global state
let currentUserEmail = null;

// Date Picker
const datePicker = flatpickr("#datePicker", {
  dateFormat: "Y-m-d",
  disableMobile: true,
  onChange: function (selectedDates, dateStr) {
    if (selectedDates.length > 0) {
      searchNotesByDate(selectedDates[0]);
      document.getElementById("clearDateFilter").classList.add("visible");
    }
  },
});

// Search functionality
let currentSearchTerm = "";
let currentSelectedDate = null;

// Initialize theme
const savedTheme = localStorage.getItem("theme") || "dark-mode";
body.classList.add(savedTheme);
updateThemeIcon(savedTheme);

// Event Listeners
document.getElementById("clearDateFilter").addEventListener("click", () => {
  datePicker.clear();
  currentSelectedDate = null;
  document.getElementById("clearDateFilter").classList.remove("visible");
  filterNotes();
});

document.getElementById("calendarIcon").addEventListener("click", () => {
  datePicker.open();
});

document.getElementById("searchBar").addEventListener("input", function () {
  currentSearchTerm = this.value.trim().toLowerCase();
  filterNotes();
});

// Auth State Management
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserEmail = user.email;
    toggleLoginState();
    loadUserNotes();
    try {
      await loadProfileImage();
    } catch (error) {
      console.error("Profile image error:", error);
      userProfileImage.src = "images/admin_icon.png";
    }
  } else {
    currentUserEmail = null;
    toggleLoginState();
    userProfileImage.src = "images/admin_icon.png";
  }
});

// Authentication Functions
const validatePassword = (password) => {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength && hasLetter && hasNumber && hasSpecialChar
  );
};

// UI Functions
function toggleLoginState() {
  if (currentUserEmail) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    addBtn.style.display = "inline-block";
    welcomeSection.style.display = "none";
    admin_icon.style.display = "block";
    searchContainer.style.display = "flex";
  } else {
    logoutBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
    addBtn.style.display = "none";
    welcomeSection.style.display = "flex";
    admin_icon.style.display = "none";
    searchContainer.style.display = "none";
  }
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector("i");
  if (theme === "light-mode") {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }
}

// Note Functions
function clearNotes() {
  main.innerHTML = "";
}

async function loadUserNotes() {
  try {
    const notesRef = collection(db, "notes");
    const q = query(
      notesRef,
      where("userEmail", "==", currentUserEmail),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    main.innerHTML = "";
    querySnapshot.forEach((doc) => {
      renderNote({ id: doc.id, ...doc.data() });
    });
    checkAndShowPlaceholder();
  } catch (error) {
    console.error("Note loading error:", error);
  }
}

function renderNote(noteData) {
  const note = document.createElement("div");
  note.className = `note ${noteData.locked ? "locked-note" : ""}`;
  note.setAttribute("data-id", noteData.id);
  const noteDate = noteData.createdAt?.toDate();

  // FIX: Add locked state to textarea attributes
  const isLocked = noteData.locked;
  const isNewNote = !noteData.id;

  note.innerHTML = `
    <div class="icons">
      <i class="fas fa-trash delete"></i>
      <i class="fas fa-lock ${isLocked ? "locked" : ""}"></i>
      <i class="fas fa-save save" style="display: ${
        isNewNote ? "block" : "none"
      }"></i>
      <i class="fas fa-edit edit" style="display: ${
        isNewNote ? "none" : "block"
      }"></i>
    </div>
    <div class="title-div">
      <textarea placeholder="Title" ${
        isLocked || !isNewNote ? "readonly" : ""
      }>${noteData.title || ""}</textarea>
    </div>
    <textarea placeholder="Take a note..." ${
      isLocked || !isNewNote ? "readonly" : ""
    }>${noteData.content || ""}</textarea>
    <div class="date-time" data-date="${noteDate.toISOString()}">
      ${noteDate.toLocaleString()}
    </div>
  `;

  // Add blur effect to locked notes
  if (isLocked) {
    note.querySelectorAll("textarea").forEach((textarea) => {
      textarea.style.filter = "blur(5px)";
    });
  }

  addNoteListeners(note);
  main.appendChild(note);
}

function addNoteListeners(noteElement) {
  const saveBtn = noteElement.querySelector(".save");
  const editBtn = noteElement.querySelector(".edit");
  const deleteBtn = noteElement.querySelector(".delete");
  const lockIcon = noteElement.querySelector(".fa-lock");
  const title = noteElement.querySelector(".title-div textarea");
  const content = noteElement.querySelector(
    "textarea:not(.title-div textarea)"
  );

  // Edit button functionality
  editBtn?.addEventListener("click", () => {
    // FIX: Prevent editing locked notes
    if (lockIcon.classList.contains("locked")) {
      alert("Note is locked. Unlock to edit.");
      return;
    }

    title.readOnly = false;
    content.readOnly = false;
    saveBtn.style.display = "block";
    editBtn.style.display = "none";
  });

  // Lock/Unlock functionality
  lockIcon.addEventListener("click", async () => {
    const noteId = noteElement.getAttribute("data-id");
    const isLocked = noteElement.classList.contains("locked-note");

    if (!isLocked) {
      const pin = prompt("Set 4-digit PIN for this note:");
      if (pin && pin.length === 4 && !isNaN(pin)) {
        await toggleNoteLock(noteId, true, pin);
        noteElement.classList.add("locked-note");
        noteElement.querySelectorAll("textarea").forEach((t) => {
          t.readOnly = true;
          t.style.filter = "blur(5px)";
        });
        lockIcon.classList.add("locked");
      }
    } else {
      const noteDoc = await getDoc(doc(db, "notes", noteId));
      const enteredPin = prompt("Enter PIN to unlock:");

      if (enteredPin === noteDoc.data().pin) {
        await toggleNoteLock(noteId, false);
        noteElement.classList.remove("locked-note");
        noteElement.querySelectorAll("textarea").forEach((t) => {
          t.readOnly = false;
          t.style.filter = "none";
        });
        lockIcon.classList.remove("locked");
      } else {
        alert("Incorrect PIN!");
      }
    }
  });

  // Delete Note
  deleteBtn.addEventListener("click", async () => {
    const isLocked = lockIcon.classList.contains("locked");
    let proceed = false;

    if (isLocked) {
      const noteId = noteElement.getAttribute("data-id");
      const noteDoc = await getDoc(doc(db, "notes", noteId));
      const enteredPin = prompt("Enter PIN to delete:");
      proceed = enteredPin === noteDoc.data().pin;
    } else {
      proceed = confirm("Delete this note?");
    }

    if (proceed) {
      const noteId = noteElement.getAttribute("data-id");
      if (noteId) {
        await deleteDoc(doc(db, "notes", noteId));
        await loadUserNotes();
      } else {
        noteElement.remove();
        checkAndShowPlaceholder();
        location.reload();
      }
    } else {
      alert("Deletion canceled");
    }
  });

  // Save Note
  saveBtn.addEventListener("click", async () => {
    if (lockIcon.classList.contains("locked")) {
      alert("Unlock note before saving");
      return;
    }

    const noteId = noteElement.getAttribute("data-id");

    if (noteId) {
      await setDoc(
        doc(db, "notes", noteId),
        {
          title: title.value,
          content: content.value,
          userEmail: currentUserEmail,
          createdAt: new Date(),
          locked: lockIcon.classList.contains("locked"),
        },
        { merge: true }
      );
    } else {
      await saveNoteToFirestore(title.value, content.value);
    }

    // FIX: Refresh notes after save
    await loadUserNotes();
  });
}

async function saveNoteToFirestore(title, content) {
  try {
    await addDoc(collection(db, "notes"), {
      title,
      content,
      userEmail: currentUserEmail,
      createdAt: new Date(),
      locked: false,
    });
  } catch (error) {
    console.error("Note save error:", error);
  }
}

async function toggleNoteLock(noteId, lockState, pin) {
  try {
    await setDoc(
      doc(db, "notes", noteId),
      { locked: lockState, ...(lockState && { pin }) },
      { merge: true }
    );
  } catch (error) {
    console.error("Lock toggle error:", error);
  }
}

function createNewNote() {
  document.querySelectorAll(".note").forEach((note) => {
    note.style.display = "none";
  });

  const note = document.createElement("div");
  note.className = "note";
  note.innerHTML = `
    <div class="icons">
      <i class="fas fa-trash delete"></i>
      <i class="fas fa-lock"></i>
      <i class="fas fa-save save" style="display: block"></i>
      <i class="fas fa-edit edit" style="display: none"></i>
    </div>
    <div class="title-div">
      <textarea placeholder="Note title..."></textarea>
    </div>
    <textarea placeholder="Start typing..."></textarea>
    <div class="date-time">${new Date().toLocaleString()}</div>
  `;

  main.prepend(note);
  note.querySelector(".title-div textarea").focus();
  addNoteListeners(note);
  checkAndShowPlaceholder();
}

function showNoNotesPlaceholder() {
  const placeholder = document.createElement("div");
  placeholder.className = "no-notes-placeholder";
  placeholder.innerHTML = `
    <i class="fas fa-sticky-note"></i>
    <p>No notes found. Create your first note!</p>
  `;
  main.appendChild(placeholder);
}

function checkAndShowPlaceholder() {
  const notesExist = document.querySelectorAll(".note").length > 0;
  const placeholder = document.querySelector(".no-notes-placeholder");

  if (!notesExist && !placeholder) {
    showNoNotesPlaceholder();
  } else if (notesExist && placeholder) {
    placeholder.remove();
  }
}

function filterNotes() {
  const notes = document.querySelectorAll(".note");

  notes.forEach((note) => {
    const title = note.querySelector(".title-div textarea").value.toLowerCase();
    const noteDate = new Date(note.querySelector(".date-time").dataset.date);
    const matchesTitle = title.includes(currentSearchTerm);
    const matchesDate = currentSelectedDate
      ? noteDate.toDateString() === currentSelectedDate.toDateString()
      : true;

    note.style.display = matchesTitle && matchesDate ? "flex" : "none";
  });

  const calendarIcon = document.getElementById("calendarIcon");
  if (currentSelectedDate) {
    calendarIcon.style.color = "#0078d7";
  } else {
    calendarIcon.style.color = body.classList.contains("dark-mode")
      ? "#888"
      : "#666";
  }
}

function searchNotesByDate(date) {
  currentSelectedDate = date;
  filterNotes();
}

// Event Handlers
addBtn.addEventListener("click", createNewNote);

themeToggle.addEventListener("click", () => {
  if (body.classList.contains("dark-mode")) {
    body.classList.replace("dark-mode", "light-mode");
    localStorage.setItem("theme", "light-mode");
    updateThemeIcon("light-mode");
  } else {
    body.classList.replace("light-mode", "dark-mode");
    localStorage.setItem("theme", "dark-mode");
    updateThemeIcon("dark-mode");
  }
});

document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordField = document.getElementById("loginPassword");
    const isPassword = passwordField.type === "password";
    passwordField.type = isPassword ? "text" : "password";
    this.classList.toggle("fa-eye-slash", isPassword);
    this.classList.toggle("fa-eye", !isPassword);
  });

document
  .getElementById("toggleSignupPassword")
  .addEventListener("click", function () {
    const passwordField = document.getElementById("signupPassword");
    const isPassword = passwordField.type === "password";
    passwordField.type = isPassword ? "text" : "password";
    this.classList.toggle("fa-eye-slash", isPassword);
    this.classList.toggle("fa-eye", !isPassword);
  });

// Form Handlers
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const signupEmail = document.querySelector("#signupEmail").value;
  const signupPassword = document.querySelector("#signupPassword").value;

  if (!validatePassword(signupPassword)) {
    alert(
      "Password must contain:\n- 8+ characters\n- 1 letter\n- 1 number\n- 1 special character"
    );
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      signupEmail,
      signupPassword
    );
    alert("Account created successfully!");
    currentUserEmail = userCredential.user.email;
    toggleLoginState();
    loginModal.style.display = "none";
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const loginEmail = document.querySelector("#loginEmail").value;
  const loginPassword = document.querySelector("#loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginEmail,
      loginPassword
    );
    alert("Login successful!");
    currentUserEmail = userCredential.user.email;
    toggleLoginState();
    loginModal.style.display = "none";
  } catch (error) {
    alert("Invalid credentials. Please try again.");
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("You've been logged out");
    toggleLoginState();
    clearNotes();
  } catch (error) {
    alert(`Logout error: ${error.message}`);
  }
});

loginBtn.addEventListener("click", () => {
  loginModal.style.display = "block";
});

closeModal.addEventListener("click", () => {
  loginModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = "none";
  }
});

signupLink.addEventListener("click", () => {
  authForm.style.display = "none";
  signupForm.style.display = "block";
});

loginLink.addEventListener("click", () => {
  signupForm.style.display = "none";
  authForm.style.display = "block";
});

document.getElementById("forgot-password").addEventListener("click", (e) => {
  e.preventDefault();
  const email = prompt("Enter your email for password reset:");
  if (email) {
    sendPasswordResetEmail(auth, email)
      .then(() => alert("Password reset email sent!"))
      .catch((error) => alert(`Error: ${error.message}`));
  } else {
    alert("Email is required!");
  }
});

// ======================
// Profile Image Handling
// ======================
const cloudinaryCloudName = "dzvkiiinm";
const cloudinaryUploadPreset = "profile_images";

// Profile image upload handler
document
  .getElementById("profileImageUpload")
  .addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();
      if (data.secure_url) {
        await saveProfileImageToFirestore(data.secure_url);
        userProfileImage.src = data.secure_url;
        alert("Profile image updated!");
      } else {
        throw new Error("Cloudinary upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Image upload failed");
    }
  });

/**
 * Saves profile image URL to Firestore
 * @param {string} downloadURL - Image URL
 */
const saveProfileImageToFirestore = async (downloadURL) => {
  try {
    await setDoc(
      doc(db, "users", currentUserEmail),
      { profileImage: downloadURL },
      { merge: true }
    );
  } catch (error) {
    console.error("Profile save error:", error);
  }
};

/**
 * Loads profile image from Firestore
 */
const loadProfileImage = async () => {
  try {
    const docSnap = await getDoc(doc(db, "users", currentUserEmail));
    if (docSnap.exists() && docSnap.data().profileImage) {
      userProfileImage.src = docSnap.data().profileImage;
    } else {
      userProfileImage.src = "images/admin_icon.png";
    }
  } catch (error) {
    console.error("Profile load error:", error);
    userProfileImage.src = "images/admin_icon.png";
  }
};

// ======================
// UI Helpers
// ======================
// Scroll to top button
window.onscroll = () => {
  scrollToTopBtn.style.display = window.scrollY > 20 ? "block" : "none";
};

scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Show all notes (clears filters)
const showAllNotes = () => {
  document.querySelectorAll(".note").forEach((note) => {
    note.style.display = "flex";
  });
};

// Prevent pull-to-refresh at top of page
let startY = 0;
window.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length === 1) startY = e.touches[0].clientY;
  },
  { passive: false }
);

window.addEventListener(
  "touchmove",
  (e) => {
    if (window.scrollY === 0 && e.touches[0].clientY > startY) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// ===================== MOBILE TOUCH HANDLING =====================
// Fix persistent hover states on mobile devices
function handleMobileTouch() {
  // Only apply to touch devices
  if (!("ontouchstart" in window)) return;

  // Remove hover states after touch events
  const touchElements = document.querySelectorAll(
    ".btn, #addBtn, .fa-save, .fa-trash, .fa-edit, .fa-lock, #scrollToTopBtn"
  );

  touchElements.forEach((element) => {
    // Remove existing listeners to prevent duplicates
    element.removeEventListener("touchstart", handleTouchStart);
    element.removeEventListener("touchend", handleTouchEnd);

    // Add new listeners
    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchend", handleTouchEnd);
  });
}

function handleTouchStart(e) {
  // Add a class to track touch state
  this.classList.add("touched");
}

function handleTouchEnd(e) {
  // Remove touch class after a short delay
  setTimeout(() => {
    this.classList.remove("touched");
  }, 150);
}

// Initialize mobile touch handling
handleMobileTouch();

// Re-initialize when new notes are added
const originalCreateNewNote = createNewNote;
createNewNote = function () {
  originalCreateNewNote();
  // Re-apply touch handling to new elements
  setTimeout(handleMobileTouch, 100);
};

// Re-initialize touch handling when notes are loaded
const originalLoadUserNotes = loadUserNotes;
loadUserNotes = async function () {
  await originalLoadUserNotes();
  // Re-apply touch handling to loaded elements
  setTimeout(handleMobileTouch, 100);
};
