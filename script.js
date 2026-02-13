// ==================== Smart Study Planner JS ====================

// Load subjects from localStorage
let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
subjects = subjects.filter(sub => sub.startDate && sub.endDate); // remove old invalid entries
localStorage.setItem('subjects', JSON.stringify(subjects));

// References
const subjectForm = document.getElementById('subjectForm');
const subjectNameInput = document.getElementById('subjectName');
const totalChaptersInput = document.getElementById('totalChapters');
const prioritySelect = document.getElementById('priority');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const subjectsContainer = document.getElementById('subjectsContainer');

// Initial render
renderSubjects();

// Handle form submit
subjectForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validation
    if (!subjectNameInput.value.trim() || !totalChaptersInput.value || !startDateInput.value || !endDateInput.value) {
        alert("Please fill all fields correctly!");
        return;
    }

    if (new Date(startDateInput.value) > new Date(endDateInput.value)) {
        alert("Start date cannot be after end date!");
        return;
    }

    const newSubject = {
        name: subjectNameInput.value.trim(),
        chapters: parseInt(totalChaptersInput.value),
        priority: prioritySelect.value,
        completed: 0,
        startDate: startDateInput.value,
        endDate: endDateInput.value
    };

    subjects.push(newSubject);
    saveAndRender();

    // Clear inputs
    subjectNameInput.value = '';
    totalChaptersInput.value = '';
    startDateInput.value = '';
    endDateInput.value = '';
});

// Calculate total days
function getTotalDays(start, end) {
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

// Priority weights
const priorityWeights = { High: 3, Medium: 2, Low: 1 };

// Render subjects
function renderSubjects() {
    subjectsContainer.innerHTML = '';
    const totalWeight = subjects.reduce((acc, s) => acc + priorityWeights[s.priority], 0);

    subjects.forEach((sub, index) => {
        const totalDays = getTotalDays(sub.startDate, sub.endDate);
        const chaptersPerDay = Math.ceil((priorityWeights[sub.priority] / totalWeight) * sub.chapters / totalDays);

        const card = document.createElement('div');
        card.className = 'subject-card';
        card.dataset.index = index;
        card.innerHTML = `
            <h3>${sub.name} <span class="priority ${sub.priority.toLowerCase()}">${sub.priority}</span></h3>
            <p>Total Chapters: ${sub.chapters}</p>
            <p>Chapters/day: ${chaptersPerDay}</p>
            <p>Completed: ${sub.completed}/${sub.chapters}</p>
            <p>Study Period: ${formatDate(sub.startDate)} ➔ ${formatDate(sub.endDate)}</p>
            <button class="mark-btn">Mark 1 Chapter Done ✅</button>
            <div class="progress-bar">
                <div class="progress" style="width: ${(sub.completed / sub.chapters) * 100}%"></div>
            </div>
        `;
        subjectsContainer.appendChild(card);
    });
}

// Event delegation for mark button
subjectsContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('mark-btn')) {
        const card = e.target.closest('.subject-card');
        const index = parseInt(card.dataset.index);
        if (subjects[index].completed < subjects[index].chapters) {
            subjects[index].completed++;
            saveAndRender();
        }
    }
});

// Save subjects to localStorage and re-render
function saveAndRender() {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    renderSubjects();
}

// Format date nicely
function formatDate(dateStr) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}
