import { db } from './firebase-config.js';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const adminPanel = document.querySelector('.admin-panel');
const feedGrid = document.querySelector('.feed-panel .feed-grid');
let currentView = "New Questions"; 
let allDoubtsCache = []; // Store doubts locally to filter without re-fetching

// 1. DROPDOWN HANDLERS
document.querySelectorAll('.messages-dropdown-container li').forEach(item => {
    item.addEventListener('click', () => {
        currentView = item.childNodes[0].textContent.trim();
        document.querySelector('.section-header h2').innerText = `Dashboard: ${currentView}`;
        renderTeacherDashboard(allDoubtsCache);
    });
});

// 2. REAL-TIME LISTENER
const q = query(collection(db, "doubts"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
    allDoubtsCache = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    renderTeacherDashboard(allDoubtsCache);
});

// 3. RENDER DASHBOARD
function renderTeacherDashboard(doubts) {
    // If user is typing in a textarea, DO NOT re-render the admin panel part
    // This prevents the text box from disappearing while typing
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') {
        // We only update the counts and side feed, but skip the main cards
        renderClassFeed(doubts);
        updateCounts(doubts);
        return; 
    }

    const header = adminPanel.querySelector('.section-header');
    adminPanel.innerHTML = '';
    if(header) adminPanel.appendChild(header);

    let filtered = [];
    if (currentView === "New Questions") filtered = doubts.filter(d => d.status === "Pending");
    else if (currentView === "Answered") filtered = doubts.filter(d => d.status === "Answered");
    else if (currentView === "Flagged") filtered = doubts.filter(d => d.status === "Spam");

    filtered.forEach(doubt => {
        const card = document.createElement('div');
        card.className = 'card';
        if(doubt.status === 'Pending') card.classList.add('urgent'); // Visual cue

        // We attach the ID to the button dataset to retrieve it later
        card.innerHTML = `
            <p class="label">${doubt.subject} Question:</p>
            <p class="content">${doubt.question}</p>
            ${doubt.answer ? `<p style="color:green; margin:5px 0;"><strong>Ans:</strong> ${doubt.answer}</p>` : ''}
            
            ${doubt.status === 'Pending' ? `<textarea id="ans-${doubt.id}" placeholder="Type answer..."></textarea>` : ''}
            
            <div class="card-footer">
                <div class="btns">
                    ${doubt.status === 'Pending' ? `<button class="btn-gray submit-ans-btn" data-id="${doubt.id}">Post Answer</button>` : ''}
                    ${doubt.status !== 'Spam' ? `<button class="btn-blue spam-btn" data-id="${doubt.id}">Spam</button>` : `<button class="btn-gray restore-btn" data-id="${doubt.id}">Restore</button>`}
                </div>
            </div>
        `;
        adminPanel.appendChild(card);
    });

    // Re-attach event listeners because we replaced innerHTML
    attachEventListeners();
    renderClassFeed(doubts);
    updateCounts(doubts);
}

// 4. EVENT LISTENERS (Delegation or Re-attachment)
function attachEventListeners() {
    document.querySelectorAll('.submit-ans-btn').forEach(btn => {
        btn.addEventListener('click', (e) => submitAnswer(e.target.dataset.id));
    });
    document.querySelectorAll('.spam-btn').forEach(btn => {
        btn.addEventListener('click', (e) => updateStatus(e.target.dataset.id, "Spam"));
    });
    document.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => updateStatus(e.target.dataset.id, "Pending"));
    });
}

// 5. ACTIONS
async function submitAnswer(id) {
    const textarea = document.getElementById(`ans-${id}`);
    const val = textarea.value.trim();
    if (!val) return alert("Please type an answer!");

    const doubtRef = doc(db, "doubts", id);
    await updateDoc(doubtRef, {
        answer: val,
        status: "Answered"
    });
}

async function updateStatus(id, status) {
    const doubtRef = doc(db, "doubts", id);
    await updateDoc(doubtRef, {
        status: status
    });
}

// 6. HELPER: Render Side Feed
function renderClassFeed(doubts) {
    if (!feedGrid) return;
    feedGrid.innerHTML = '';
    const colorMap = { 'f-blue': 'blue', 'f-orange': 'orange', 'f-green': 'green' };

    // Show top 5 recent interactions
    doubts.slice(0, 5).forEach(doubt => {
        const tile = document.createElement('div');
        tile.className = `tile ${colorMap[doubt.classColor] || 'blue'}`;
        tile.innerHTML = `
            <p class="label">${doubt.subject}</p>
            <p class="tile-text"><strong>Q:</strong> ${doubt.question}</p>
            ${doubt.answer ? `<p class="tile-text"><strong>A:</strong> ${doubt.answer}</p>` : '<em>Pending...</em>'}
        `;
        feedGrid.appendChild(tile);
    });
}

function updateCounts(doubts) {
    const counts = document.querySelectorAll('.dropdown-box .count');
    if(counts.length >= 3) {
        counts[0].innerText = `(${doubts.filter(d => d.status === "Pending").length})`;
        counts[1].innerText = `(${doubts.filter(d => d.status === "Answered").length})`;
        counts[2].innerText = `(${doubts.filter(d => d.status === "Spam").length})`;
    }
}