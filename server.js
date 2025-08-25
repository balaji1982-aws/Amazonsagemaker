const express = require("express");
const path = require("path");
const { google } = require("googleapis");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Serve static files
app.use(express.static(path.join(__dirname, "public")));

// 2. Google Sheets auth
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "projectk.json"), // <- put JSON key here
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

// 3. API endpoint to fetch sheet data
app.get("/api/sheet", async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "1ZeO8AfLgbS3bMPl3U3zFtY27QstSZDiRJa8WnY3KbXQ"; // <-- replace with your sheet ID
    const range = "Sheet1!A1:M20"; // <-- adjust range

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    res.json(response.data.values || []);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching sheet");
  }
});

// 4. Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

