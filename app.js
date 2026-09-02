const express = require("express");
const fs = require("fs");
const path = require("path");
const net = require("net");
const { execFile } = require("child_process");
const rateLimit = require("express-rate-limit");

const app = express();

// Rate limiting protects the application from excessive requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);

// FIX 1: Prevent reflected XSS by returning JSON instead of raw HTML
app.get("/hello", (req, res) => {
    const name = String(req.query.name || "");
    res.json({ message: `Hello ${name}` });
});

// FIX 2: Prevent path traversal using an allowlist
const allowedFiles = {
    "welcome.txt": path.join(__dirname, "public", "welcome.txt"),
    "about.txt": path.join(__dirname, "public", "about.txt")
};

app.get("/file", (req, res) => {
    const requestedFile = String(req.query.file || "");

    if (!Object.prototype.hasOwnProperty.call(allowedFiles, requestedFile)) {
        return res.status(400).send("Invalid file");
    }

    const contents = fs.readFileSync(allowedFiles[requestedFile], "utf8");
    res.type("text/plain").send(contents);
});

// FIX 3: Prevent command injection by validating input
// and using execFile instead of constructing a shell command
app.get("/ping", (req, res) => {
    const host = String(req.query.host || "");

    if (!net.isIP(host)) {
        return res.status(400).send("A valid IP address is required");
    }

    execFile("ping", [host], (error, stdout) => {
        if (error) {
            return res.status(500).send("Command failed");
        }

        res.type("text/plain").send(stdout);
    });
});

app.listen(3000, () => {
    console.log("Security demo application running on port 3000");
});
