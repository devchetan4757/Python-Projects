const express = require("express");
const cors = require("cors");
const path = require("path");
const { spawn } = require("child_process");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'../frontend')));

app.get("/",(req,res) =>{
    res.sendFile(path.join(__dirname,"../frontend",
"index.html"));
})
app.post("/api/analyze", (req, res) => {
    const url = req.body.url;
    if (!url) return res.status(400).json({ error: "URL is required" });

    // Spawn Python process
    const python = spawn("python", ["scanner.py"]);

    let output = "";
    let errorOutput = "";

    python.stdin.write(JSON.stringify({ url }));
    python.stdin.end();

    python.stdout.on("data", (data) => {
        output += data.toString();
    });

    python.stderr.on("data", (data) => {
        errorOutput += data.toString();
    });

    python.on("close", () => {
        if (errorOutput.trim().length > 0) {
            return res.status(500).json({
                error: "Python error",
                python_error: errorOutput
            });
        }

        if (output.trim().length === 0) {
            return res.status(500).json({
                error: "Python returned empty output",
                output
            });
        }

        try {
            res.json(JSON.parse(output));
        } catch {
            res.status(500).json({
                error: "Failed to parse Python output",
                output
            });
        }
    });
});

app.listen(3000, () => {
    console.log("Backend running at http://localhost:3000");
});
