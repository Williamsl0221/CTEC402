const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");

const app = express();

// Vulnerability 1: Reflected Cross-Site Scripting (XSS)
app.get("/hello", (req, res) => {
    const name = req.query.name;
    res.send("<h1>Hello " + name + "</h1>");
});

// Vulnerability 2: Path Traversal
app.get("/file", (req, res) => {
    const file = req.query.file;
    const contents = fs.readFileSync("./public/" + file, "utf8");
    res.send(contents);
});

// Vulnerability 3: Command Injection
app.get("/ping", (req, res) => {
    const host = req.query.host;

    exec("ping " + host, (error, stdout) => {
        if (error) {
            res.send("Command failed");
            return;
        }

        res.send(stdout);
    });
});

app.listen(3000, () => {
    console.log("Security demo application running on port 3000");
});
