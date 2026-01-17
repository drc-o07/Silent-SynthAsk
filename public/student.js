// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBAK95zAZkX4bj45xnqXS9LMTPjQjcDOBo",
  authDomain: "silent-synthask.firebaseapp.com",
  projectId: "silent-synthask",
  storageBucket: "silent-synthask.firebasestorage.app",
  messagingSenderId: "273937385011",
  appId: "1:273937385011:web:a1e463da178a3b42278546"
};

// Initialize connection
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

// --- 3. CLICKING A SUBJECT (Opens the Box) ---
subjectCards.forEach(card => {
    card.addEventListener('click', () => {
        // 1. Get the subject name from the card text
        currentSubject = card.querySelector('span').textContent;
        
        // 2. Get the color (e.g., convert 'c-blue' to 'f-blue' for the feed)
        const colorClass = card.classList[1]; 
        currentClass = colorClass ? colorClass.replace('c-', 'f-') : 'f-blue';

        // 3. Update Title and Show Modal
        modalTitle.innerText = `Ask a ${currentSubject} Doubt`;
        modal.style.display = "block";
        doubtText.focus(); // Automatically put cursor in box
    });
});

// --- 4. SUBMITTING THE QUESTION ---
submitBtn.addEventListener('click', function() {
    const question = doubtText.value.trim();
    
    if (question !== "") {
        submitBtn.innerText = "Posting...";
        submitBtn.disabled = true;

        // Save to Cloud Database
        db.collection("doubts").add({
            subject: currentSubject,
            classColor: currentClass,
            question: question,
            answer: null, // No answer yet
            status: "Pending", // Needs teacher attention
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            // Success!
            doubtText.value = ""; 
            modal.style.display = "none";
            submitBtn.innerText = "Post to Feed";
            submitBtn.disabled = false;
        }).catch((error) => {
            console.error("Error:", error);
            alert("Could not post. Check internet connection.");
            submitBtn.disabled = false;
        });
    } else {
        alert("Please type a question!");
    }
});

// --- 5. REAL-TIME FEED (Updates Automatically) ---
db.collection("doubts").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    feedGrid.innerHTML = ''; // Clear list

    if (snapshot.empty) {
        feedGrid.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">No questions asked yet.</p>';
        return;
    }

    snapshot.forEach((doc) => {
        const doubt = doc.data();
        const newPost = document.createElement('div');
        newPost.className = `feed-item ${doubt.classColor || 'f-blue'}`; // Apply color
        
        // Logic: If there is an answer, show it. If not, show "Waiting..."
        let answerHtml = doubt.answer 
            ? `<div style="margin-top:10px; padding:10px; background:rgba(255,255,255,0.3); border-radius:5px;"><strong>Teacher:</strong><br>${doubt.answer}</div>` 
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

// --- 6. CLOSE MODAL HELPERS ---
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

// --- 7. SEARCH BAR LOGIC ---
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.feed-item');
    items.forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(term) ? 'flex' : 'none';
    });
});