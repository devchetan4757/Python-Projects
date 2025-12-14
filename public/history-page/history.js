const menuBtn = document.getElementById("menu");
const menuPanel = document.querySelector(".threeLines");


menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  menuPanel.classList.toggle("active");
});

// close if clicking outside
document.addEventListener("click", (e) => {
  if (menuPanel.classList.contains("active") &&
    !menuPanel.contains(e.target) &&
    e.target !== menuBtn) {

    menuPanel.classList.remove("active");
  }
});

const API_URL = "/api/reports";

// LOAD REPORTS
async function loadReports() {
  try {
    const res = await fetch(API_URL);
    const reports = await res.json();

    const reportsDiv = document.getElementById("reports");
    reportsDiv.innerHTML = "";

    if (reports.length === 0) {
      reportsDiv.innerHTML = "<p>No history reports yet.</p>";
      return;
    }

    reports.forEach(report => {
      const history = document.createElement("div");
      history.classList.add("history-card");

      history.innerHTML = `
        <h3 class="url">${report.url}</h3>
        <div class="verdict">${report.verdict}</div>
        <div class="score">${report.score}</div>
        <button class="delete-btn">Delete</button>
      `;

      history.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm("Delete this report?")) deleteReport(report._id);
      });

      reportsDiv.appendChild(history);
    });
  } catch (err) {
    console.error("Error loading reports:", err);
  }
}

// DELETE REPORT
async function deleteReport(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadReports();
  } catch (err) {
    console.error("Error deleting report:", err);
  }
}

// LOAD REPORTS ON PAGE LOAD
document.addEventListener("DOMContentLoaded", loadReports);
