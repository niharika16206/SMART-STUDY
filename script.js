// ==================== Smart Study Planner JS ====================

// ==================== Priority Weights (MOVED TO TOP) ====================
const priorityWeights = { 
    High: 3, 
    Medium: 2, 
    Low: 1 
};

// ==================== Load subjects from localStorage ====================
let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
subjects = subjects.filter(sub => sub.startDate && sub.endDate);
localStorage.setItem('subjects', JSON.stringify(subjects));

// ==================== References ====================
const subjectForm = document.getElementById('subjectForm');
const subjectNameInput = document.getElementById('subjectName');
const totalChaptersInput = document.getElementById('totalChapters');
const prioritySelect = document.getElementById('priority');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const subjectsContainer = document.getElementById('subjectsContainer');

// ==================== Initial Render ====================
renderSubjects();

// ==================== Handle Form Submit ====================
subjectForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (
        !subjectNameInput.value.trim() ||
        !totalChaptersInput.value ||
        !startDateInput.value ||
        !endDateInput.value
    ) {
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

    subjectForm.reset();
});

// ==================== Calculate Total Days ====================
function getTotalDays(start, end) {
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

// ==================== Render Subjects ====================
function renderSubjects() {
    subjectsContainer.innerHTML = '';

    if (subjects.length === 0) {
        subjectsContainer.innerHTML = "<p>No subjects added yet.</p>";
        return;
    }

    const totalWeight = subjects.reduce(
        (acc, s) => acc + (priorityWeights[s.priority] || 1),
        0
    );

    subjects.forEach((sub, index) => {

        const totalDays = getTotalDays(sub.startDate, sub.endDate);

        const chaptersPerDay = totalDays > 0
            ? Math.ceil(
                ((priorityWeights[sub.priority] || 1) / totalWeight) *
                (sub.chapters / totalDays)
              )
            : sub.chapters;

        const progressPercent = (sub.completed / sub.chapters) * 100;

        const card = document.createElement('div');
        card.className = 'subject-card';
        card.dataset.index = index;

        card.innerHTML = `
            <h3>
                ${sub.name} 
                <span class="priority ${sub.priority.toLowerCase()}">
                    ${sub.priority}
                </span>
            </h3>
            <p>Total Chapters: ${sub.chapters}</p>
            <p>Chapters/day: ${chaptersPerDay}</p>
            <p>Completed: ${sub.completed}/${sub.chapters}</p>
            <p>Study Period: ${formatDate(sub.startDate)} ➔ ${formatDate(sub.endDate)}</p>
            <button class="mark-btn">Mark 1 Chapter Done ✅</button>
            <div class="progress-bar">
                <div class="progress" style="width: ${progressPercent}%"></div>
            </div>
        `;

        subjectsContainer.appendChild(card);
    });
}

// ==================== Mark Chapter Complete ====================
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

// ==================== Save & Re-render ====================
function saveAndRender() {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    renderSubjects();
}

// ==================== Format Date ====================
function formatDate(dateStr) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}
