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

// ==================== Render Subjects (UPDATED) ====================
function renderSubjects() {

    activeContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    const today = new Date();

    // 🔥 SMART SORTING
    subjects.sort((a, b) => {

        const aEnd = new Date(a.endDate);
        const bEnd = new Date(b.endDate);

        const aRemaining = a.chapters - a.completed;
        const bRemaining = b.chapters - b.completed;

        // 1️⃣ Nearest deadline first
        if (aEnd - bEnd !== 0) {
            return aEnd - bEnd;
        }

        // 2️⃣ Higher priority first
        if (priorityWeights[b.priority] !== priorityWeights[a.priority]) {
            return priorityWeights[b.priority] - priorityWeights[a.priority];
        }

        // 3️⃣ More remaining chapters first
        return bRemaining - aRemaining;
    });

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
        const endDate = new Date(sub.endDate);

        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        let warningText = "";
        let warningClass = "";

        if (sub.status === "completed") {
            warningText = "Completed ✅";
            warningClass = "completed";
        } 
        else if (daysLeft < 0) {
            warningText = "Overdue 🚨";
            warningClass = "overdue";
        } 
        else if (daysLeft === 0) {
            warningText = "Due Today 🔴";
            warningClass = "today";
        } 
        else if (daysLeft <= 3) {
            warningText = `${daysLeft} Days Left ⚠️`;
            warningClass = "warning";
        } 
        else {
            warningText = `${daysLeft} Days Left`;
            warningClass = "normal";
        }

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

            <p class="deadline ${warningClass}">${warningText}</p>

            <p><strong>Total:</strong> ${sub.chapters}</p>
            <p><strong>Completed:</strong> ${sub.completed}/${sub.chapters}</p>
            <p><strong>Period:</strong> ${formatDate(sub.startDate)} ➔ ${formatDate(sub.endDate)}</p>

            <div class="progress-bar">
                <div class="progress" style="width: ${progressPercent}%"></div>
            </div>

            <div class="card-buttons">
                ${sub.status === "active" ? `<button class="complete-btn">+1 Chapter</button>` : ``}
                <button class="delete-btn">Delete</button>
                <button class="schedule-btn">View Schedule</button>
            </div>

            <div class="schedule-container" style="display:none;"></div>
        `;

        if (sub.status === "active") {
            activeContainer.appendChild(card);
        } else {
            completedContainer.appendChild(card);
        }
    });
}

// ==================== Rest of your original JS stays SAME ====================
