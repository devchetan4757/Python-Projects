import dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import express from "express";
import cors from "cors";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { spawn } from "child_process";
const app = express();

import connectDB from "./src/config/db.js";
import router from "./src/routes/router.js";
connectDB(process.env.MONGODB_URI);

app.use(cors());
app.use(express.json());
app.use("/api/reports",router);
app.use(express.static(path.join(__dirname,
'./public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,
 "./public/home-page/index.html"));
});


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
