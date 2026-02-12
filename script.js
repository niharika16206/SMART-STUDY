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