// ==================== Smart Study Planner PRO JS ====================

// ==================== Priority Weights ====================
const priorityWeights = {
    High: 3,
    Medium: 2,
    Low: 1
};

// ==================== Load from localStorage ====================
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];

// ==================== References ====================
const subjectForm = document.getElementById("subjectForm");
const subjectNameInput = document.getElementById("subjectName");
const totalChaptersInput = document.getElementById("totalChapters");
const prioritySelect = document.getElementById("priority");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

const activeContainer = document.getElementById("activeContainer");
const completedContainer = document.getElementById("completedContainer");

const totalSubjectsEl = document.getElementById("totalSubjects");
const activePlansEl = document.getElementById("activePlans");
const chaptersRemainingEl = document.getElementById("chaptersRemaining");
const completionRateEl = document.getElementById("completionRate");

// ==================== Init ====================
renderAll();

// ==================== Form Submit ====================
subjectForm.addEventListener("submit", function (e) {
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
        id: Date.now(),
        name: subjectNameInput.value.trim(),
        chapters: parseInt(totalChaptersInput.value),
        priority: prioritySelect.value,
        completed: 0,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        status: "active",
        completedDate: null
    };

    subjects.push(newSubject);
    saveAndRender();
    subjectForm.reset();
});

// ==================== Render All ====================
function renderAll() {
    renderSubjects();
    updateDashboard();
}

// ==================== Render Subjects ====================
function renderSubjects() {

    activeContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    const activeSubjects = subjects.filter(s => s.status === "active");
    const completedSubjects = subjects.filter(s => s.status === "completed");

    if (activeSubjects.length === 0) {
        activeContainer.innerHTML = `<p class="empty-message">No active subjects.</p>`;
    }

    if (completedSubjects.length === 0) {
        completedContainer.innerHTML = `<p class="empty-message">No completed subjects yet.</p>`;
    }

    subjects.forEach(sub => {

        const progressPercent = (sub.completed / sub.chapters) * 100;

        const card = document.createElement("div");
        card.className = "subject-card";
        card.dataset.id = sub.id;

        card.innerHTML = `
            <h4>
                ${sub.name}
                <span class="priority ${sub.priority.toLowerCase()}">
                    ${sub.priority}
                </span>
            </h4>

            <p><strong>Total:</strong> ${sub.chapters}</p>
            <p><strong>Completed:</strong> ${sub.completed}/${sub.chapters}</p>
            <p><strong>Period:</strong> ${formatDate(sub.startDate)} ➔ ${formatDate(sub.endDate)}</p>

            <div class="progress-bar">
                <div class="progress" style="width: ${progressPercent}%"></div>
            </div>

            ${
                sub.status === "active"
                    ? `
                    <div class="card-buttons">
                        <button class="complete-btn">+1 Chapter</button>
                        <button class="delete-btn">Delete</button>
                        <button class="schedule-btn">View Schedule</button>
                    </div>
                    `
                    : `
                    <div class="card-buttons">
                        <button class="delete-btn">Delete</button>
                        <button class="schedule-btn">View Schedule</button>
                    </div>
                    `
            }

            <div class="schedule-container" style="display:none;"></div>
        `;

        if (sub.status === "active") {
            activeContainer.appendChild(card);
        } else {
            completedContainer.appendChild(card);
        }
    });
}

// ==================== Global Click Listener ====================
document.addEventListener("click", function (e) {

    const card = e.target.closest(".subject-card");
    if (!card) return;

    const id = parseInt(card.dataset.id);
    const subjectIndex = subjects.findIndex(s => s.id === id);
    if (subjectIndex === -1) return;

    const subject = subjects[subjectIndex];

    // ===== Mark Chapter Done =====
    if (e.target.classList.contains("complete-btn")) {

        if (subject.completed < subject.chapters) {
            subject.completed++;

            if (subject.completed >= subject.chapters) {
                subject.status = "completed";
                subject.completedDate = new Date().toISOString();
            }

            saveAndRender();
        }
    }

    // ===== Delete Subject =====
    if (e.target.classList.contains("delete-btn")) {

        const confirmDelete = confirm("Are you sure you want to delete this subject?");
        if (!confirmDelete) return;

        subjects.splice(subjectIndex, 1);
        saveAndRender();
    }

    // ===== Toggle Schedule =====
    if (e.target.classList.contains("schedule-btn")) {

        const scheduleContainer = card.querySelector(".schedule-container");
        const scheduleButton = e.target;

        if (scheduleContainer.style.display === "block") {
            scheduleContainer.style.display = "none";
            scheduleButton.textContent = "View Schedule";
            return;
        }

        const schedule = generateSchedule(subject);
        scheduleContainer.innerHTML = schedule;
        scheduleContainer.style.display = "block";
        scheduleButton.textContent = "Hide Schedule";
    }
});

// ==================== Schedule Generator ====================
function generateSchedule(subject) {

    const start = new Date(subject.startDate);
    const end = new Date(subject.endDate);

    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const chaptersPerDay = Math.ceil(subject.chapters / totalDays);

    let currentChapter = 1;
    let scheduleHTML = "<ul class='schedule-list'>";

    for (let i = 0; i < totalDays; i++) {

        if (currentChapter > subject.chapters) break;

        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + i);

        const from = currentChapter;
        const to = Math.min(currentChapter + chaptersPerDay - 1, subject.chapters);

        scheduleHTML += `
            <li>
                <strong>${formatDate(dayDate)}</strong> :
                Chapters ${from} - ${to}
            </li>
        `;

        currentChapter = to + 1;
    }

    scheduleHTML += "</ul>";
    return scheduleHTML;
}

// ==================== Dashboard Analytics ====================
function updateDashboard() {

    const totalSubjects = subjects.length;
    const activePlans = subjects.filter(s => s.status === "active").length;

    let totalChapters = 0;
    let totalCompleted = 0;

    subjects.forEach(s => {
        totalChapters += s.chapters;
        totalCompleted += s.completed;
    });

    const chaptersRemaining = totalChapters - totalCompleted;

    const completionRate =
        totalChapters === 0
            ? 0
            : Math.round((totalCompleted / totalChapters) * 100);

    totalSubjectsEl.textContent = totalSubjects;
    activePlansEl.textContent = activePlans;
    chaptersRemainingEl.textContent = chaptersRemaining;
    completionRateEl.textContent = completionRate + "%";
}

// ==================== Save & Re-render ====================
function saveAndRender() {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    renderAll();
}

// ==================== Format Date ====================
function formatDate(dateStr) {
    if (!dateStr) return "";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}
