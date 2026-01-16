
const adminPanel = document.querySelector('.admin-panel');
const feedGrid = document.querySelector('.feed-panel .feed-grid');
let currentView = "New Questions"; 
let isTyping = false; // THE LOCK: prevents refresh while typing

// --- 1. HANDLE DROPDOWN CLICKS ---
document.querySelectorAll('.messages-dropdown-container li').forEach(item => {
    item.addEventListener('click', () => {
        currentView = item.childNodes[0].textContent.trim();
        document.querySelector('.section-header h2').innerText = `Dashboard: ${currentView}`;
        isTyping = false; // Reset lock on view change
        renderTeacherDashboard();
    });
});

// --- 2. RENDER FUNCTION ---
function renderTeacherDashboard() {
    // Check if the user is currently focused on a textarea or if the lock is on
    if (isTyping || (document.activeElement && document.activeElement.tagName === 'TEXTAREA')) {
        return; 
    }

    const allDoubts = JSON.parse(localStorage.getItem('allDoubts')) || [];
    const header = adminPanel.querySelector('.section-header');
    
    adminPanel.innerHTML = '';
    if(header) adminPanel.appendChild(header);

    let filtered = [];
    if (currentView === "New Questions") filtered = allDoubts.filter(d => d.status === "Pending");
    else if (currentView === "Answered") filtered = allDoubts.filter(d => d.status === "Answered");
    else if (currentView === "Flagged") filtered = allDoubts.filter(d => d.status === "Spam");

    filtered.forEach(doubt => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <p class="label">${doubt.subject} Question:</p>
            <p class="content">${doubt.question}</p>
            ${doubt.answer ? `<p style="color:green; margin:5px 0;"><strong>Ans:</strong> ${doubt.answer}</p>` : ''}
            
            ${doubt.status === 'Pending' ? `<textarea id="ans-${doubt.id}" placeholder="Type answer..." onfocus="setTyping(true)" onblur="setTyping(false)"></textarea>` : ''}
            
            <div class="card-footer">
                <div class="btns">
                    ${doubt.status === 'Pending' ? `<button class="btn-gray" onclick="submitAnswer(${doubt.id})">Post Answer</button>` : ''}
                    ${doubt.status !== 'Spam' ? `<button class="btn-blue" onclick="markSpam(${doubt.id})">Spam</button>` : `<button class="btn-gray" onclick="restoreDoubt(${doubt.id})">Restore</button>`}
                </div>
            </div>
        `;
        adminPanel.appendChild(card);
    });

    renderClassFeed(allDoubts);
    updateCounts(allDoubts);
}

// --- 3. HELPER FUNCTIONS ---

window.setTyping = function(status) {
    // If there is text in the box, keep it locked. If empty and blurred, unlock.
    const activeEntry = document.activeElement;
    if (!status && activeEntry && activeEntry.value === "") {
        isTyping = false;
    } else {
        isTyping = status;
    }
};

window.renderClassFeed = function(allDoubts) {
    if (!feedGrid) return;
    feedGrid.innerHTML = '';
    const colorMap = { 'f-blue': 'blue', 'f-orange': 'orange', 'f-green': 'green' };

    allDoubts.slice().reverse().forEach(doubt => {
        const tile = document.createElement('div');
        tile.className = `tile ${colorMap[doubt.classColor] || 'blue'}`;
        tile.innerHTML = `
            <p class="label">${doubt.subject}</p>
            <p class="tile-text"><strong>Q:</strong> ${doubt.question}</p>
            ${doubt.answer ? `<p class="tile-text"><strong>A:</strong> ${doubt.answer}</p>` : '<em>Pending...</em>'}
        `;
        feedGrid.appendChild(tile);
    });
};

window.submitAnswer = function(id) {
    const textarea = document.getElementById(`ans-${id}`);
    const val = textarea.value.trim();
    if (!val) return alert("Please type an answer!");

    let db = JSON.parse(localStorage.getItem('allDoubts'));
    const i = db.findIndex(d => d.id === id);
    db[i].answer = val;
    db[i].status = "Answered";
    
    localStorage.setItem('allDoubts', JSON.stringify(db));
    
    isTyping = false; // Unlock after submission
    renderTeacherDashboard();
};

window.markSpam = function(id) {
    let db = JSON.parse(localStorage.getItem('allDoubts'));
    const i = db.findIndex(d => d.id === id);
    db[i].status = "Spam";
    localStorage.setItem('allDoubts', JSON.stringify(db));
    renderTeacherDashboard();
};

window.restoreDoubt = function(id) {
    let db = JSON.parse(localStorage.getItem('allDoubts'));
    const i = db.findIndex(d => d.id === id);
    db[i].status = "Pending";
    localStorage.setItem('allDoubts', JSON.stringify(db));
    renderTeacherDashboard();
};

function updateCounts(db) {
    const counts = document.querySelectorAll('.dropdown-box .count');
    if(counts.length >= 3) {
        counts[0].innerText = `(${db.filter(d => d.status === "Pending").length})`;
        counts[1].innerText = `(${db.filter(d => d.status === "Answered").length})`;
        counts[2].innerText = `(${db.filter(d => d.status === "Spam").length})`;
    }
}

renderTeacherDashboard();
setInterval(renderTeacherDashboard, 4000);