// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBAK95zAZkX4bj45xnqXS9LMTPjQjcDOBo",
  authDomain: "silent-synthask.firebaseapp.com",
  projectId: "silent-synthask",
  storageBucket: "silent-synthask.firebasestorage.app",
  messagingSenderId: "273937385011",
  appId: "1:273937385011:web:a1e463da178a3b42278546"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- 2. SELECT ELEMENTS ---
const subjectCards = document.querySelectorAll('.subject-card');
const feedGrid = document.querySelector('.feed-grid');
const modal = document.getElementById('doubtModal');
const closeBtn = document.querySelector('.close-btn');
const submitBtn = document.getElementById('submitDoubt');
const doubtText = document.getElementById('doubtText');
const modalTitle = document.getElementById('modalTitle');
const searchInput = document.getElementById('searchBar');

let currentSubject = "General";
let currentClass = "f-blue";

// --- 3. CLICKING A SUBJECT ---
subjectCards.forEach(card => {
    card.addEventListener('click', () => {
        currentSubject = card.querySelector('span').textContent;
        const colorClass = card.classList[1]; 
        currentClass = colorClass ? colorClass.replace('c-', 'f-') : 'f-blue';
        modalTitle.innerText = `Ask a ${currentSubject} Doubt`;
        modal.style.display = "block";
        doubtText.focus();
    });
});

// --- 4. SUBMITTING ---
submitBtn.addEventListener('click', function() {
    const question = doubtText.value.trim();
    if (question !== "") {
        submitBtn.innerText = "Posting...";
        submitBtn.disabled = true;
        db.collection("doubts").add({
            subject: currentSubject,
            classColor: currentClass,
            question: question,
            answer: null,
            status: "Pending",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            doubtText.value = ""; 
            modal.style.display = "none";
            submitBtn.innerText = "Post to Feed";
            submitBtn.disabled = false;
        }).catch((error) => {
            console.error("Error:", error);
            alert("Could not post.");
            submitBtn.disabled = false;
        });
    } else {
        alert("Please type a question!");
    }
});

// --- 5. REAL-TIME FEED ---
db.collection("doubts").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    feedGrid.innerHTML = ''; 
    if (snapshot.empty) {
        feedGrid.innerHTML = '<p style="text-align:center; padding:20px; opacity:0.7;">No questions asked yet.</p>';
        return;
    }
    snapshot.forEach((doc) => {
        const doubt = doc.data();
        const newPost = document.createElement('div');
        newPost.className = `feed-item ${doubt.classColor || 'f-blue'}`; 
        
        // Darker background for answer box in dark mode is handled by transparency
        let answerHtml = doubt.answer 
            ? `<div style="margin-top:10px; padding:10px; background:rgba(0,0,0,0.2); border-radius:5px;"><strong>Teacher:</strong><br>${doubt.answer}</div>` 
            : `<p style="font-style:italic; font-size:0.8rem; opacity:0.8;">Waiting for teacher reply...</p>`;

        newPost.innerHTML = `
            <div>
                <small style="opacity: 0.9; font-weight:bold;">${doubt.subject}</small>
                <p style="margin-top:5px; font-size:1.1rem;">${doubt.question}</p>
                ${answerHtml}
            </div>
        `;
        feedGrid.appendChild(newPost);
    });
});

// --- 6. HELPERS ---
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.feed-item').forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(term) ? 'flex' : 'none';
    });
});

// --- 7. DARK MODE LOGIC ---
const toggleBtn = document.getElementById('darkModeToggle');
const body = document.body;

// Check saved preference on load
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    toggleBtn.innerText = "☀️";
}

toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    toggleBtn.innerText = isDark ? "☀️" : "🌙";
});