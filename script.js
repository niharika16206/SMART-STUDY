// ==================== Smart Study Planner JS ====================

// Clear old subjects without start/end dates
let oldSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
oldSubjects = oldSubjects.filter(sub => sub.startDate && sub.endDate);
localStorage.setItem('subjects', JSON.stringify(oldSubjects));

// References
const subjectForm = document.getElementById('subjectForm');
const subjectNameInput = document.getElementById('subjectName');
const totalChaptersInput = document.getElementById('totalChapters');
const prioritySelect = document.getElementById('priority');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const subjectsContainer = document.getElementById('subjectsContainer');

// Load subjects
let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
renderSubjects();

// Handle form submit
subjectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate dates
    if (!startDateInput.value || !endDateInput.value) {
        alert("Please enter both start and end dates!");
        return;
    }
    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);
    if (start > end) {
        alert("Start date cannot be after end date!");
        return;
    }

    const subject = {
        name: subjectNameInput.value.trim(),
        chapters: parseInt(totalChaptersInput.value),
        priority: prioritySelect.value,
        completed: 0,
        startDate: startDateInput.value,
        endDate: endDateInput.value
    };

    subjects.push(subject);
    saveAndRender();

    // Clear inputs
    subjectNameInput.value = '';
    totalChaptersInput.value = '';
    startDateInput.value = '';
    endDateInput.value = '';
});

// Calculate total days
function getTotalDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// Priority weights
const priorityWeights = { High: 3, Medium: 2, Low: 1 };

// Render subjects
function renderSubjects() {
    subjectsContainer.innerHTML = '';
    let totalWeight = subjects.reduce((acc, sub) => acc + priorityWeights[sub.priority], 0);

    subjects.forEach((sub, index) => {
        const totalDays = getTotalDays(sub.startDate, sub.endDate);
        const chaptersPerDay = Math.ceil((priorityWeights[sub.priority] / totalWeight) * sub.chapters / totalDays);

        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = `
            <h3>${sub.name} <span class="priority ${sub.priority.toLowerCase()}">${sub.priority}</span></h3>
            <p>Total Chapters: ${sub.chapters}</p>
            <p>Chapters/day: ${chaptersPerDay}</p>
            <p>Completed: ${sub.completed}/${sub.chapters}</p>
            <p>Study Period: ${formatDate(sub.startDate)} ➔ ${formatDate(sub.endDate)}</p>
            <button onclick="markCompleted(${index})">Mark 1 Chapter Done ✅</button>
            <div class="progress-bar">
                <div class="progress" style="width: ${(sub.completed / sub.chapters) * 100}%"></div>
            </div>
        `;
        subjectsContainer.appendChild(card);
    });
}

// Mark chapter completed
function markCompleted(index) {
    if (subjects[index].completed < subjects[index].chapters) {
        subjects[index].completed += 1;
        saveAndRender();
    }
}

// Save and render
function saveAndRender() {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    renderSubjects();
}

// Format date nicely
function formatDate(dateStr) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}
