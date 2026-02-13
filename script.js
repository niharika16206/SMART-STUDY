// ==================== Smart Study Planner JS ====================

// ------------------ Auto-clear old data ------------------
// Remove old subjects if they do not have startDate (from older version)
let oldSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
oldSubjects = oldSubjects.filter(sub => sub.startDate); // keep only new subjects with startDate
localStorage.setItem('subjects', JSON.stringify(oldSubjects));

// References
const subjectForm = document.getElementById('subjectForm');
const subjectNameInput = document.getElementById('subjectName');
const totalChaptersInput = document.getElementById('totalChapters');
const prioritySelect = document.getElementById('priority');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const subjectsContainer = document.getElementById('subjectsContainer');

// Load subjects from localStorage
let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
renderSubjects();

// Handle form submit
subjectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const subject = {
        name: subjectNameInput.value,
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

// Calculate total days for a subject
function getTotalDays(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
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
            <p>Study Period: ${sub.startDate} ➔ ${sub.endDate}</p>
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

// Save to localStorage and render
function saveAndRender() {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    renderSubjects();
}
