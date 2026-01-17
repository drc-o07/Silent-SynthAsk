// --- 1. FIREBASE CONFIG ---
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
const container = document.getElementById('adminCardsContainer');
const feedGrid = document.querySelector('.feed-grid');

// --- 3. LISTEN FOR QUESTIONS (Real-time) ---
db.collection("doubts").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    
    // Safety check: If teacher is typing, don't refresh the whole list 
    // (This prevents the textbox from disappearing while typing)
    if (document.activeElement.tagName === "TEXTAREA") {
        return; 
    }

    const allDoubts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    renderDashboard(allDoubts);
});

// --- 4. RENDER FUNCTION ---
function renderDashboard(doubts) {
    container.innerHTML = ''; // Clear current list

    // Filter to show only Unanswered (Pending) questions first
    const pendingDoubts = doubts.filter(d => d.status === "Pending");

    if (pendingDoubts.length === 0) {
        container.innerHTML = '<p>No new questions pending.</p>';
    }

    pendingDoubts.forEach(doubt => {
        const card = document.createElement('div');
        card.className = 'card urgent'; // 'urgent' adds the red line on the left
        
        card.innerHTML = `
            <span class="status-tag">Needs Answer</span>
            <p class="label"><strong>${doubt.subject}</strong> Question:</p>
            <p class="content" style="font-size:1.1rem;">${doubt.question}</p>
            
            <textarea id="ans-${doubt.id}" placeholder="Type your answer here..." style="width:100%; padding:10px; margin:10px 0; border:1px solid #ddd; border-radius:5px;"></textarea>
            
            <div class="card-footer">
                <div class="btns">
                    <button class="btn-blue post-btn" data-id="${doubt.id}">Post Answer</button>
                    <button class="btn-gray spam-btn" data-id="${doubt.id}">Mark Spam</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Attach click listeners to the new buttons
    attachListeners();
    renderSideFeed(doubts);
}

// --- 5. BUTTON ACTIONS ---
function attachListeners() {
    // Post Answer Buttons
    document.querySelectorAll('.post-btn').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.getAttribute('data-id');
            const textArea = document.getElementById(`ans-${id}`);
            const answerText = textArea.value.trim();

            if (answerText) {
                // Update Firebase
                db.collection("doubts").doc(id).update({
                    answer: answerText,
                    status: "Answered"
                });
            } else {
                alert("Please type an answer first.");
            }
        };
    });

    // Spam Buttons
    document.querySelectorAll('.spam-btn').forEach(btn => {
        btn.onclick = (e) => {
            const id = e.target.getAttribute('data-id');
            if(confirm("Hide this question?")) {
                db.collection("doubts").doc(id).update({
                    status: "Spam"
                });
            }
        };
    });
}

// --- 6. SIDEBAR (History) ---
function renderSideFeed(doubts) {
    feedGrid.innerHTML = '';
    // Show the last 5 questions (even answered ones)
    doubts.slice(0, 5).forEach(doubt => {
        const div = document.createElement('div');
        div.className = `tile ${doubt.classColor || 'blue'}`;
        div.style.padding = '15px';
        div.style.marginBottom = '10px';
        div.style.borderRadius = '8px';
        div.style.color = 'white';
        
        // Simple Color Map fallback
        if(doubt.classColor === 'f-orange') div.style.background = '#f5a623';
        else if(doubt.classColor === 'f-green') div.style.background = '#5cb85c';
        else div.style.background = '#4a90e2';

        div.innerHTML = `
            <small>${doubt.subject}</small>
            <p style="margin:5px 0;"><strong>Q:</strong> ${doubt.question}</p>
            ${doubt.answer ? `<p style="margin:0; font-size:0.9rem; opacity:0.9;"><strong>A:</strong> ${doubt.answer}</p>` : ''}
        `;
        feedGrid.appendChild(div);
    });
}