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
    depth.textContent = "...";

    const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
    });

    const data = await response.json();

    // SCORE
    scoreBox.textContent = data.score;

    // UPDATE VERDICT based on score
    data.verdict = getVerdict(data.score);

    // COLOR SYSTEM (same container + score box)
    applyRiskColor(data.score);

    // BUILD DEPTH FIELDS
    depth.innerHTML = `
        <div class="field-box">
            <h3>URL:</h3>
            <p>${data.url}</p>
        </div>

        <div class="field-box">
            <h3>Verdict:</h3>
            <p>${data.verdict}</p>
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
}

// 3-category system
function getVerdict(score) {
    if (score < 3) return "LOW RISK";
    if (score === 3) return "MINIMAL RISK";
    return "RISKY";
}

// Colors for score + container
function applyRiskColor(score) {
    const scoreBox = document.getElementById("score");
    const scoreContainer = document.getElementById("score-container");

    if (score < 3) {
        scoreBox.style.background = "#19A00F"; // green
        scoreContainer.style.background = "#19A00F";
    } 
    else if (score === 3) {
        scoreBox.style.background = "#f39c12"; // orange
        scoreContainer.style.background = "#f39c12";
    } 
    else {
        scoreBox.style.background = "red";
        scoreContainer.style.background = "red";
    }
}

function formatList(arr) {
    if (!arr || arr.length === 0) {
        return "<span class='empty'>Empty</span>";
    }
    return "<ul>" + arr.map(item => `<li>${item}</li>`).join("") + "</ul>";
}
