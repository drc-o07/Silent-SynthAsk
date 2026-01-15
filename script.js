// 1. Select Elements
const searchInput = document.getElementById('searchBar');
const subjectCards = document.querySelectorAll('.subject-card');
const feedGrid = document.querySelector('.feed-grid');
const subjectTitle = document.querySelector('.subjects-column h2');

// 2. Search Logic (Improved)
searchInput.addEventListener('input', () => {
    const filter = searchInput.value.toLowerCase();
    subjectCards.forEach(card => {
        const text = card.querySelector('span').textContent.toLowerCase();
        // Uses a subtle fade effect instead of just disappearing
        if (text.includes(filter)) {
            card.style.display = 'flex';
            card.style.opacity = '1';
        } else {
            card.style.display = 'none';
            card.style.opacity = '0';
        }
    });
});

// 3. Handle Subject Selection
subjectCards.forEach(card => {
    card.addEventListener('click', () => {
        const selectedSubject = card.querySelector('span').textContent;
        
        // Visual feedback: remove active class from others, add to this one
        subjectCards.forEach(c => c.style.border = "none");
        card.style.border = "3px solid #3b82f6";
        
        // Update Feed Header
        subjectTitle.textContent = `Browsing: ${selectedSubject}`;
        
        // Logic to filter the Class Feed (Placeholder for actual data fetching)
        console.log(`Filtering feed for: ${selectedSubject}`);
        filterFeedBySubject(selectedSubject);
    });
});

// 4. Interaction for "Reply" and "Open" buttons
// Using Event Delegation to handle buttons even if new feed items are added
feedGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
        const action = e.target.textContent;
        const postText = e.target.parentElement.querySelector('p').innerText;
        
        if (action === "Reply") {
            const reply = prompt(`Replying to: "${postText.substring(0, 30)}..." \n\nEnter your answer:`);
            if (reply) alert("Your response has been submitted!");
        } else if (action === "Open" || action === "View") {
            alert("Opening detailed view...");
        }
    }
});

// 5. Function to Simulate Feed Filtering
function filterFeedBySubject(subject) {
    // In a real app, you would fetch data from a database here.
    // For now, we will just show a notification.
    const items = document.querySelectorAll('.feed-item');
    items.forEach(item => {
        item.style.transition = "0.3s";
        item.style.transform = "translateY(10px)";
        item.style.opacity = "0.5";
        
        setTimeout(() => {
            item.style.transform = "translateY(0)";
            item.style.opacity = "1";
        }, 300);
    });
}