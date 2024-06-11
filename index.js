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
        const languageCode = text;
        fetchCandidates(languageCode, res);
    } else if (text.startsWith('1*') || text.startsWith('2*')) {
        handleCandidateSelection(text, res, phoneNumber);
    } else {
        response = `END Invalid input!`;
        sendResponse(res, response);
    }

    function fetchCandidates(languageCode, res) {
        const sql = 'SELECT id, name FROM candidates';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching candidates:', err.message);
                response = `END Error fetching candidates. Please try again.`;
                sendResponse(res, response);
                return;
            }

            let candidateList = '';
            results.forEach((row, index) => {
                candidateList += `${index + 1}. ${row.name}\n`;
            });

            if (languageCode == '1') {
                response = `CON Hitamo Umukandida\n${candidateList}`;
            } else {
                response = `CON Select candidate\n${candidateList}`;
            }

            sendResponse(res, response);
        });
    }

    function handleCandidateSelection(text, res, phoneNumber) {
        const parts = text.split('*');
        const languageCode = parts[0];
        const candidateIndex = parts[1] - 1;
        const confirmation = parts[2];

        const sql = 'SELECT name FROM candidates LIMIT 1 OFFSET ?';
        db.query(sql, [candidateIndex], (err, results) => {
            if (err) {
                console.error('Error fetching candidate:', err.message);
                response = `END Error fetching candidate. Please try again.`;
                sendResponse(res, response);
                return;
            }

            if (results.length === 0) {
                response = languageCode == '1'
                    ? `END Umukandida ntabwo abonetse`
                    : `END Candidate not found`;
                sendResponse(res, response);
                return;
            }

            candidate = results[0].name;

            if (!confirmation) {
                response = languageCode == '1'
                    ? `CON Emeza gutora ${candidate}\n1.Yego\n2.Oya`
                    : `CON Confirm to vote ${candidate}\n1.Yes\n2.No`;
                sendResponse(res, response);
            } else {
                if (confirmation == '1') {
                    language = languageCode == '1' ? 'kinyarwanda' : 'english';
                    checkVote(res, phoneNumber, language, candidate);
                } else if (confirmation == '2') {
                    response = languageCode == '1'
                        ? 'END Mwakoze Gukoresh iyi service'
                        : 'END Thank you for using our services';
                    sendResponse(res, response);
                } else if (confirmation == '20') {
                    getVotes(res, languageCode == '1' ? 'kinyarwanda' : 'english');
                } else if (confirmation == '0') {
                    ext(res, languageCode == '1' ? 'kinyarwanda' : 'english');
                } else {
                    response = `END Invalid input!`;
                    sendResponse(res, response);
                }
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
            console.log('Vote saved successfully');
            response = `END Voting ${candidate} successful!`;
            sendResponse(res, response);
        });
    }

    function checkVote(res, phoneNumber, language, candidate) {
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
            console.log('Query executed successfully!');
        });
    }

    function getVotes(res, language) {
        const sql = 'SELECT candidate, COUNT(*) AS repetition_times FROM amatora GROUP BY candidate';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching votes:', err.message);
                response = `END Error fetching votes. Please try again.`;
                sendResponse(res, response);
                return;
            }

            let votesResponse = '';
            let counter = 1;

            if (results.length > 0) {
                results.forEach(row => {
                    const candidate = row.candidate;
                    const votes = row.repetition_times;
                    votesResponse += `${counter}. ${candidate}: ${votes}\n`;
                    counter++;
                });
            } else {
                votesResponse = 'No votes recorded yet.';
            }

            response = language === 'kinyarwanda'
                ? `END Amajwi:\n${votesResponse}`
                : `END Votes:\n${votesResponse}`;
            sendResponse(res, response);
        });
    }

    function ext(res, language) {
        response = language === 'kinyarwanda'
            ? `END Mwakoze gukoresha iyi serivisi`
            : `END Thank you for using our services`;
        sendResponse(res, response);
    }

    function sendResponse(res, response) {
        res.set('Content-Type', 'text/plain');
        res.send(response);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`USSD server listening on http://localhost:${PORT}`));
