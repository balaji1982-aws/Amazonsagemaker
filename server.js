const express = require("express");
const path = require("path");
const { google } = require("googleapis");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve index.html
app.use(express.static(__dirname));

// Google Sheets API setup
async function getSheetData() {
  // Load credentials from environment variables
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID, // set in Render env
    range: "Sheet1!A1:E10", // adjust as needed
  });

  return res.data.values || [];
}

// API endpoint
app.get("/api/sheet-data", async (req, res) => {
  try {
    const rows = await getSheetData();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data from Google Sheets");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
