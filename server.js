const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer();

app.use(express.static('.'));  // Serve your HTML file
app.use(express.urlencoded({ extended: true }));

// Load or create Excel file
let workbook;
const excelFile = 'rsvp_data.xlsx';
const sheetName = 'RSVPs';
if (fs.existsSync(excelFile)) {
    workbook = XLSX.readFile(excelFile);
} else {
    workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Name', 'Email', 'contact', 'Guests', 'Attendance', 'Message']]), 'RSVPs');
}

app.post('/rsvp', upload.none(), (req, res) => {

    const { name, email, contact, guests, attendance, Message } = req.body;
    if (!name || !email || !contact || !guests || !attendance) {
        console.log('Validation failed: Missing fields');
        return res.status(400).send('Error: All required fields must be filled.');
}
    try {
    const sheet = workbook.Sheets['RSVPs'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    data.push([name, email, contact, guests, attendance, Message]);

    workbook.Sheets['RSVPs'] = XLSX.utils.aoa_to_sheet(data);
    workbook.Sheets['RSVPs']['!cols']=[
        { wch: 15 },  // name
        { wch: 25 },  // email
        { wch: 15 },  // contact
        { wch: 10 },  // guest
        { wch: 12 },  // attendance
        { wch: 30 }   // message
    ];
    XLSX.writeFile(workbook, excelFile);

    res.send('RSVP submitted! Thank you.');
} catch (error) {
        console.error('Error saving to Excel:', error);
        res.status(500).send('Error: Could not save RSVP. Please try again.');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));