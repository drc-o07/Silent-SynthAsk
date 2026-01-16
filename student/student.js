












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
let currentFilter = "Most Recent"; // Tracks the dropdown selection

// --- 1. YOUR ORIGINAL SEARCH LOGIC ---
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    // Filter Subject Cards
    subjectCards.forEach(card => {
        const subjectName = card.querySelector('span').textContent.toLowerCase();
        card.style.display = subjectName.includes(query) ? 'flex' : 'none';
    });

    // Filter Feed Items
    const feedItems = document.querySelectorAll('.feed-item');
    feedItems.forEach(item => {
        const postText = item.innerText.toLowerCase();
        item.style.display = postText.includes(query) ? 'flex' : 'none';
    });
});

// --- 2. INTEGRATED DROPDOWN FILTER LOGIC ---
// Listens for clicks on your dropdown menu items without breaking your original code
document.querySelectorAll('.messages-dropdown-container li, .dropdown-box li').forEach(item => {
    item.addEventListener('click', () => {
        // Gets text like "Questions Asked" or "Most Recent"
        currentFilter = item.childNodes[0].textContent.trim();
        renderFeed(); 
    });
});

// --- 3. YOUR ORIGINAL MODAL TRIGGER ---
subjectCards.forEach(card => {
    card.addEventListener('click', () => {
        currentSubject = card.querySelector('span').textContent;
        currentClass = card.classList[1].replace('c-', 'f-'); 
        
        modalTitle.innerText = `Ask a ${currentSubject} Doubt`;
        modal.style.display = "block";
    });
});

// --- 4. YOUR ORIGINAL SUBMIT LOGIC (Updated to save to Shared Storage) ---
submitBtn.addEventListener('click', () => {
    const question = doubtText.value.trim();
    
    if (question !== "") {
        const newDoubt = {
            id: Date.now(),
            subject: currentSubject,
            classColor: currentClass,
            question: question,
            answer: null,
            status: "Pending"
        };

        // Save to Shared Storage
        const allDoubts = JSON.parse(localStorage.getItem('allDoubts')) || [];
        allDoubts.push(newDoubt);
        localStorage.setItem('allDoubts', JSON.stringify(allDoubts));

        // Reset and close
        doubtText.value = "";
        modal.style.display = "none";
        
        // Refresh the UI
        renderFeed();
    }
});

// --- 5. INTEGRATED RENDER FUNCTION (Handles Filters and Anti-Refresh for Text) ---
function renderFeed() {
    if (!feedGrid) return;

    // PROTECTION: If the user is currently typing in a textarea, skip the refresh
    // This prevents the text from disappearing every 3 seconds
    if (document.activeElement && document.activeElement.tagName === "TEXTAREA") {
        return; 
    }

    feedGrid.innerHTML = ''; // Clear to prevent duplicates
    let allDoubts = JSON.parse(localStorage.getItem('allDoubts')) || [];

    // Apply Dropdown Filtering
    if (currentFilter === "Questions Asked") {
        // Only show doubts that haven't been flagged as spam
        allDoubts = allDoubts.filter(doubt => doubt.status !== "Spam");
    }

    // Show latest doubts first
    allDoubts.reverse().forEach(doubt => {
        const newPost = document.createElement('div');
        newPost.className = `feed-item ${doubt.classColor}`; 
        
        newPost.innerHTML = `
            <div>
                <small style="opacity: 0.8;">${doubt.subject}</small>
                <p><strong>Student</strong><br>${doubt.question}</p>
                ${doubt.answer ? 
                    `<div style="margin-top:10px; padding:10px; background:rgba(255,255,255,0.5); border-radius:5px;">
                        <strong>Teacher:</strong><br>${doubt.answer}
                    </div>` : 
                    `<p style="font-style:italic; font-size:0.8rem;">Waiting for teacher reply...</p>`
                }
            </div>
            <button class="btn">${doubt.answer ? 'Thank!' : 'Reply'}</button>
        `;
        feedGrid.appendChild(newPost);
    });

    // Empty state message
    if (allDoubts.length === 0) {
        feedGrid.innerHTML = `<p style="text-align:center; color:gray; padding:20px; width:100%;">No questions found in "${currentFilter}".</p>`;
    }
}

// Modal Helpers
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

// Run on page load
renderFeed();

// Auto-refresh every 3 seconds (Will respect the 'is typing' check above)
setInterval(renderFeed, 3000);