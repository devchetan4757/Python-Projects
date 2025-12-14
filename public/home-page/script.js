// === ANALYSIS FUNCTION ===
async function startAnalysis() {
  const url = document.getElementById("url-input").value.trim();
  if (!url) {
    alert("Enter URL first.");
    return;
  }

  const scoreBox = document.getElementById("score");
  const scoreContainer = document.getElementById("score-container");
  const depth = document.getElementById("views");

  scoreBox.textContent = "Analyzing...";
  scoreBox.style.background = "#ECF0F1";
  scoreContainer.style.background = "#ECF0F1";
  depth.textContent = "...";

  try {
    const response = await fetch("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    // SCORE
    scoreBox.textContent = data.score;

    // VERDICT
    data.verdict = getVerdict(data.score);

    // COLOR
    applyRiskColor(data.score);

    // DISPLAY DETAILS
    depth.innerHTML = `
      <div class="field-box">
          <h3>URL:</h3>
          <p id="url">${data.url}</p>
      </div>

      <div class="field-box">
          <h3>Verdict:</h3>
          <p id="verdict">${data.verdict}</p>
      </div>

      <div class="field-box">
          <h3>URL Reasons:</h3>
          <p>${formatList(data.url_reasons)}</p>
      </div>

      <div class="field-box">
          <h3>Network Reasons:</h3>
          <p>${formatList(data.network_reasons)}</p>
      </div>

      <div class="field-box">
          <h3>Fake Login Reasons:</h3>
          <p>${formatList(data.fake_login_reasons)}</p>
      </div>

      <div class="field-box">
          <h3>Environment Warnings:</h3>
          <p>${formatList(data.environment_warnings)}</p>
      </div>
    `;

    // CREATE REPORT
    createReport();

  } catch (err) {
    alert("Error analyzing URL. Make sure the server is running.");
    console.error(err);
  }
}

// === VERDICT SYSTEM ===
function getVerdict(score) {
  if (score < 3) return "LOW RISK";
  if (score === 3) return "MINIMAL RISK";
  return "RISKY";
}

// === COLOR SYSTEM ===
function applyRiskColor(score) {
  const scoreBox = document.getElementById("score");
  const scoreContainer = document.getElementById("score-container");

  if (score < 3) {
    scoreBox.style.background = "#19A00F";
    scoreContainer.style.background = "#19A00F";
  } else if (score === 3) {
    scoreBox.style.background = "#f39c12";
    scoreContainer.style.background = "#f39c12";
  } else {
    scoreBox.style.background = "red";
    scoreContainer.style.background = "red";
  }
}

// === FORMAT LIST ===
function formatList(arr) {
  if (!arr || arr.length === 0) return "<span class='empty'>Empty</span>";
  return "<ul>" + arr.map(item => `<li>${item}</li>`).join("") + "</ul>";
}

// === CLIPBOARD PASTE BUTTON ===
document.addEventListener("DOMContentLoaded", () => {
  const pasteBtn = document.querySelector(".fa-copy");
  const input = document.getElementById("url-input");

  pasteBtn?.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      input.value = text;
    } catch {
      alert("Unable to paste. Give clipboard permission.");
    }
  });
});

// === MENU TOGGLE WITH OUTSIDE CLICK ===
const menuBtn = document.getElementById("menu");
const menuPanel = document.querySelector(".threeLines");

menuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  menuPanel.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (
    menuPanel.classList.contains("active") &&
    !menuPanel.contains(e.target) &&
    e.target !== menuBtn
  ) {
    menuPanel.classList.remove("active");
  }
});

// === REPORT API ===
const API_URL = "/api/reports";

// CREATE REPORT
async function createReport() {
  const url = document.getElementById("url")?.textContent.trim();
  const score = document.getElementById("score")?.textContent.trim();
  const verdict = document.getElementById("verdict")?.textContent.trim();

  if (!url || !score || !verdict) return;

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, score, verdict })
    });
  } catch (err) {
    console.error("Error creating report:", err);
  }
}
