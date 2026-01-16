import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page reload

    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    const btn = loginForm.querySelector('.login-btn');

    try {
        btn.textContent = "Logging in...";
        btn.disabled = true;

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Success! Redirect to admin dashboard
        console.log("Logged in as:", userCredential.user.email);
        window.location.href = "admin.html";

    } catch (error) {
        console.error(error);
        alert("Login failed: " + error.message);
        btn.textContent = "Log In";
        btn.disabled = false;
    }
});