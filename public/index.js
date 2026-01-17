// 1. CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBAK95zAZkX4bj45xnqXS9LMTPjQjcDOBo",
  authDomain: "silent-synthask.firebaseapp.com",
  projectId: "silent-synthask",
  storageBucket: "silent-synthask.firebasestorage.app",
  messagingSenderId: "273937385011",
  appId: "1:273937385011:web:a1e463da178a3b42278546"
};

// Initialize
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// 2. DOM ELEMENTS
const loginForm = document.getElementById('loginForm');
const studentBtn = document.getElementById('studentBtn');

// 3. TEACHER LOGIN LOGIC
if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 

        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        const btn = loginForm.querySelector('.login-btn');

        btn.textContent = "Verifying...";
        btn.disabled = true;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Logged in:", userCredential.user.email);
                // Redirect to Admin Dashboard
                window.location.href = "admin.html";
            })
            .catch((error) => {
                console.error(error);
                alert("Login failed: " + error.message);
                btn.textContent = "Teacher Login";
                btn.disabled = false;
            });
    });
}

// 4. STUDENT REDIRECT LOGIC
if(studentBtn) {
    studentBtn.addEventListener('click', () => {
        // No login needed, just redirect
        window.location.href = "student.html";
    });
}