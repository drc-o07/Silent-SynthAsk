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

// 1. Subject Search Logic
searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    subjectCards.forEach(card => {
        const text = card.querySelector('span').textContent.toLowerCase();
        card.style.display = text.includes(filter) ? 'flex' : 'none';
    });
});

// 2. Click Subject to Open Modal
subjectCards.forEach(card => {
    card.addEventListener('click', () => {
        currentSubject = card.querySelector('span').textContent;
        // This maps 'c-blue' to 'f-blue', etc.
        currentClass = card.classList[1].replace('c-', 'f-'); 
        
        modalTitle.innerText = `Ask a ${currentSubject} Doubt`;
        modal.style.display = "block";
    });
});

// 3. Submit Doubt (Adds to the Common Feed)
submitBtn.addEventListener('click', () => {
    const question = doubtText.value.trim();
    
    if (question !== "") {
        const newPost = document.createElement('div');
        // This ensures the background color is applied
        newPost.className = `feed-item ${currentClass}`; 
        
        newPost.innerHTML = `
            <div>
                <small style="opacity: 0.8;">${currentSubject}</small>
                <p><strong>Student</strong><br>${question}</p>
            </div>
            <button class="btn">Reply</button>
        `;

        // Prepend so newest appears at the top of the common feed
        feedGrid.prepend(newPost);

        // Reset and close
        doubtText.value = "";
        modal.style.display = "none";
    }
});

// Modal Helpers
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

// Unified Search for Subjects AND Feed Topics
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    // 1. Filter Subject Cards
    subjectCards.forEach(card => {
        const subjectName = card.querySelector('span').textContent.toLowerCase();
        card.style.display = subjectName.includes(query) ? 'flex' : 'none';
    });

    // 2. Filter Feed Items (Topics)
    const feedItems = document.querySelectorAll('.feed-item');
    feedItems.forEach(item => {
        const postText = item.querySelector('p').innerText.toLowerCase();
        
        // Show item if it matches the search query, otherwise hide it
        if (postText.includes(query)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});
