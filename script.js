const button = document.querySelector("button");
const subjectsList = document.getElementById("subjectsList");

button.addEventListener("click", function() {
    const subject = document.getElementById("subject").value;
    const chapters = document.getElementById("chapters").value;
    const examDate = document.getElementById("examDate").value;

    if(subject === "" || chapters === "" || examDate === "") {
        alert("Please fill all fields");
        return;
    }

    const subjectDiv = document.createElement("div");
    subjectDiv.innerHTML = `
        <h3>${subject}</h3>
        <p>Total Chapters: ${chapters}</p>
        <p>Exam Date: ${examDate}</p>
        <hr>
    `;

    subjectsList.appendChild(subjectDiv);
});
// ==================== Smart Study Planner JS ====================

// Get references
const subjectForm = document.getElementById('subjectForm');
const subjectNameInput = document.getElementById('subjectName');
const totalChaptersInput = document.getElementById('totalChapters');
const prioritySelect = document.getElementById('priority');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const subjectsContainer = document.getElementById('subjectsContainer');

// Load from localStorage on page load
let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
renderSubjects();

// Handle form submission
subjectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const subject = {
        name: subjectNameInput.value,
        chapters: parseInt(totalChaptersInput.value),
        priority: prioritySelect.value,
        completed: 0
    };

    subjects.push(subject);
    saveAndRender();

    // Clear inputs
    subjectNameInput.value = '';
    totalChaptersInput.value = '';
});

// Calculate total days
function getTotalDays() {
    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
}

// Priority weight mapping
const priorityWeights = {
    'High': 3,
    'Medium': 2,
    'Low': 1
};

// Render subjects on screen
function renderSubjects() {
    subjectsContainer.innerHTML = '';

    const totalDays = getTotalDays();

    // Calculate total weight
    let totalWeight = subjects.reduce((acc, sub) => acc + priorityWeights[sub.priority], 0);

    subjects.forEach((sub, index) => {
        // Chapters per day based on priority
        const chaptersPerDay = Math.ceil((priorityWeights[sub.priority] / totalWeight) * sub.chapters / totalDays);

        // Create card
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = `
            <h3>${sub.name} <span class="priority ${sub.priority.toLowerCase()}">${sub.priority}</span></h3>
            <p>Total Chapters: ${sub.chapters}</p>
            <p>Chapters/day: ${chaptersPerDay}</p>
            <p>Completed: ${sub.completed}/${sub.chapters}</p>
            <button onclick="markCompleted(${index})">Mark 1 Chapter Done ✅</button>
            <div class="progress-bar">
                <div class="progress" style="width: ${(sub.completed / sub.chapters) * 100}%"></div>
            </div>
        `;
        subjectsContainer.appendChild(card);
    });
}

// Mark chapter as completed
function markCompleted(index) {
    if (subjects[index].completed < subjects[index].chapters) {
        subjects[index].completed += 1;
        saveAndRender();
    }
}

// Save to localStorage and re-render
function saveAndRender() {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    renderSubjects();
}
