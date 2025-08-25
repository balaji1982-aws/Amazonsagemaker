const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = 3000;

// Load your credentials from the downloaded JSON key
const keys = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY,'base64').toString('utf8'));

// Auth client
const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

app.get('/data', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1ZeO8AfLgbS3bMP13U3zFtY27QstSZDiRJa8WnY3kbXQ';
    const range = 'Sheet1!A1:L'; // Adjust as needed

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.json({ message: 'No data found.' });
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Optional: sanitize or transform data here (e.g., remove PII)
    const safeData = dataRows.map(row => {
      return {
        batch: row[headers.indexOf("Batch")],
        city: row[headers.indexOf("Please select the city")],
        field: row[headers.indexOf("Select your field of work")],
        hours: parseFloat(row[headers.indexOf("How much hours per month would you be able to spend for the initiatives supporting school ?")] || 0),
        hasLinkedIn: !!(row[headers.indexOf("Linkedin Profile")] || '').includes("linkedin.com")
      };
    });

    res.json(safeData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching data');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
