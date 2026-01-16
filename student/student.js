import { db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const searchInput = document.getElementById('searchBar');
const subjectCards = document.querySelectorAll('.subject-card');
const feedGrid = document.querySelector('.feed-grid');
const modal = document.getElementById('doubtModal');
const closeBtn = document.querySelector('.close-btn');
const submitBtn = document.getElementById('submitDoubt');
const doubtText = document.getElementById('doubtText');
const modalTitle = document.getElementById('modalTitle');

let currentSubject = "";
let currentClass = "";
let currentFilter = "Most Recent"; 

// 1. REAL-TIME LISTENER (Replaces setInterval)
// This runs automatically whenever the database changes
const q = query(collection(db, "doubts"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    // Convert snapshot to array
    const allDoubts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    
    renderFeed(allDoubts);
});

// 2. SEARCH LOGIC
searchInput.addEventListener('input', () => {
    // We trigger a re-render using the data we already have in memory would be best,
    // but for simplicity, we can just filter DOM nodes or re-fetch.
    // Let's stick to your DOM filter method which is fast for small lists.
    const query = searchInput.value.toLowerCase();
    
    document.querySelectorAll('.feed-item').forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
});

// 3. MODAL TRIGGERS
subjectCards.forEach(card => {
    card.addEventListener('click', () => {
        currentSubject = card.querySelector('span').textContent;
        currentClass = card.classList[1].replace('c-', 'f-'); 
        modalTitle.innerText = `Ask a ${currentSubject} Doubt`;
        modal.style.display = "block";
    });
});

// 4. SUBMIT TO FIRESTORE
submitBtn.addEventListener('click', async () => {
    const question = doubtText.value.trim();
    
    if (question !== "") {
        try {
            submitBtn.disabled = true;
            submitBtn.innerText = "Posting...";

            await addDoc(collection(db, "doubts"), {
                subject: currentSubject,
                classColor: currentClass,
                question: question,
                answer: null,
                status: "Pending",
                timestamp: serverTimestamp() // Uses server time
            });

            doubtText.value = "";
            modal.style.display = "none";
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Error posting doubt. Check console.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Post to Feed";
        }
    }
});

// 5. RENDER FUNCTION
function renderFeed(doubts) {
    if (!feedGrid) return;
    
    // Safety check: Don't wipe the grid if user is selecting text (optional)
    feedGrid.innerHTML = '';

    doubts.forEach(doubt => {
        const newPost = document.createElement('div');
        newPost.className = `feed-item ${doubt.classColor}`;
        
        // SECURITY FIX: Use textContent instead of innerHTML for user input
        const subjectEl = document.createElement('small');
        subjectEl.style.opacity = '0.8';
        subjectEl.textContent = doubt.subject;

        const pEl = document.createElement('p');
        const strongEl = document.createElement('strong');
        strongEl.textContent = "Student";
        pEl.appendChild(strongEl);
        pEl.appendChild(document.createElement('br'));
        pEl.appendChild(document.createTextNode(doubt.question));

        newPost.appendChild(subjectEl);
        newPost.appendChild(pEl);

        if(doubt.answer) {
            const ansDiv = document.createElement('div');
            ansDiv.style.marginTop = "10px";
            ansDiv.style.padding = "10px";
            ansDiv.style.background = "rgba(255,255,255,0.5)";
            ansDiv.style.borderRadius = "5px";
            ansDiv.innerHTML = `<strong>Teacher:</strong> ${doubt.answer}`; // Trusted teacher input
            newPost.appendChild(ansDiv);
        } else {
            const waitP = document.createElement('p');
            waitP.style.fontStyle = "italic";
            waitP.style.fontSize = "0.8rem";
            waitP.textContent = "Waiting for teacher reply...";
            newPost.appendChild(waitP);
        }

        feedGrid.appendChild(newPost);
    });
}

// Modal Helpers
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };