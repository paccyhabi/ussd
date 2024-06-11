const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = mysql.createConnection({
    host: 'baizb0rtpbpv1jcgkepo-mysql.services.clever-cloud.com',
    user: 'urh9jfaitvskqwmk',
    password: 'ioPmSsidC2oWWoveVY4x',
    database: 'baizb0rtpbpv1jcgkepo'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the MySQL database');
});

app.get("/api/test", function (req, res) {
    res.send("test request");
});

app.post('/ussd', (req, res) => {
    const {
        sessionId,
        serviceCode,
        phoneNumber,
        text,
    } = req.body;

    let response = '';
    let candidate = '';
    let language = '';

    if (text == '') {
        response = `CON Welcome to voting system!
           Murakaza neza kurubuga rw'amatora!
        1. Kinyarwanda
        2. English`;
        sendResponse(res, response);
    } else if (text == '1' || text == '2') {
        // Fetch candidates from the database
        fetchCandidates((err, candidates) => {
            if (err) {
                response = `END Error fetching candidates. Please try again.`;
                sendResponse(res, response);
                return;
            }

            response = `CON ` + (text == '1' ? 'Hitamo Umukandida\n' : 'Select candidate\n');
            candidates.forEach((row, index) => {
                response += `${index + 1}. ${row.candidate}\n`;
            });

            sendResponse(res, response);
        });
    } else {
        // Parse the input to get the candidate selection and language
        let inputs = text.split('*');
        if (inputs.length === 2) {
            let selectedLanguage = inputs[0];
            let candidateIndex = parseInt(inputs[1], 10) - 1;

            fetchCandidates((err, candidates) => {
                if (err || candidateIndex < 0 || candidateIndex >= candidates.length) {
                    response = `END Invalid selection. Please try again.`;
                    sendResponse(res, response);
                    return;
                }

                candidate = candidates[candidateIndex].candidate;
                response = `CON ` + (selectedLanguage == '1'
                    ? `Emeza gutora ${candidate}\n1.Yego\n2.Oya`
                    : `Confirm to vote ${candidate}\n1.Yes\n2.No`);
                sendResponse(res, response);
            });
        } else if (inputs.length === 3 && (inputs[2] === '1' || inputs[2] === '2')) {
            // Handle the confirmation
            let selectedLanguage = inputs[0];
            let candidateIndex = parseInt(inputs[1], 10) - 1;

            fetchCandidates((err, candidates) => {
                if (err || candidateIndex < 0 || candidateIndex >= candidates.length) {
                    response = `END Invalid selection. Please try again.`;
                    sendResponse(res, response);
                    return;
                }

                candidate = candidates[candidateIndex].candidate;

                if (inputs[2] === '1') {
                    language = selectedLanguage == '1' ? 'kinyarwanda' : 'english';
                    checkVote(res, phoneNumber, language, candidate, sessionId, serviceCode, text);
                } else {
                    response = selectedLanguage == '1'
                        ? 'END Mwakoze Gukoresh iyi service '
                        : 'END Thank you for using our services';
                    sendResponse(res, response);
                }
            });
        } else {
            response = `END Invalid input!`;
            sendResponse(res, response);
        }
    }
});

function fetchCandidates(callback) {
    const sql = 'SELECT candidate FROM candidates'; // Assuming you have a table named 'candidates'
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching candidates:', err.message);
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function checkVote(res, phoneNumber, language, candidate, sessionId, serviceCode, text) {
    const sql = 'SELECT * FROM amatora WHERE phoneNumber = ?';
    db.query(sql, [phoneNumber], (err, result) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            response = `END Error checking vote. Please try again.`;
            sendResponse(res, response);
            return;
        }
        if (result.length > 0) {
            response = language === 'kinyarwanda'
                ? `CON Wamaze gutora! Hitamo:\n20. Kureba amajwi\n0. Sohoka`
                : `CON You have already voted! Choose:\n20. View votes\n0. Exit`;
            sendResponse(res, response);
        } else {
            saveVote(res, sessionId, serviceCode, phoneNumber, text, candidate);
        }
    });
}

function saveVote(res, sessionId, serviceCode, phoneNumber, text, candidate) {
    const sql = 'INSERT INTO amatora (sessionId, serviceCode, phoneNumber, text, candidate) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [sessionId, serviceCode, phoneNumber, text, candidate], (err, result) => {
        if (err) {
            console.error('Error saving vote:', err.message);
            response = `END Error saving vote. Please try again.`;
            sendResponse(res, response);
            return;
        }
        response = `END Voting ${candidate} successful!`;
        sendResponse(res, response);
    });
}

function sendResponse(res, response) {
    res.set('Content-Type', 'text/plain');
    res.send(response);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`USSD server listening on http://localhost:${PORT}`));
