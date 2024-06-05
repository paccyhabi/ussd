const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = mysql.createPool({
    host: 'baizb0rtpbpv1jcgkepo-mysql.services.clever-cloud.com',
    user: 'urh9jfaitvskqwmk',
    password: 'ioPmSsidC2oWWoveVY4x',
    database: 'baizb0rtpbpv1jcgkepo'
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
    }
    console.log('Connected to the MySQL database with threadId: ' + connection.threadId);
});

app.get("/api/test", function(req,res){
    res.send("test request");
})

app.post('/ussd', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    let response = '';

    if (text === '') {
        response = `CON Welcome to voting system!
            Murakaza neza kurubuga rw'amatora!
        1. Kinyarwanda
        2. English`;
    } else {
        switch(text) {
            case '1':
            case '2':
                response = `CON Select candidate
                    1. Kamanzi Eric
                    2. Habimana Yves
                    3. Itangishaka Claude
                    4. Umwali Aliance`;
                break;
            case '1*1':
            case '1*2':
            case '1*3':
            case '1*4':
            case '2*1':
            case '2*2':
            case '2*3':
            case '2*4':
                response = `CON Confirm to vote
                    1. Yes
                    2. No`;
                break;
            case '1*1*1':
            case '1*2*1':
            case '1*3*1':
            case '1*4*1':
            case '2*1*1':
            case '2*2*1':
            case '2*3*1':
            case '2*4*1':
                const candidate = getCandidateName(text);
                if (candidate) {
                    saveVote(sessionId, serviceCode, phoneNumber, text, candidate);
                    response = `END Voting ${candidate} successful!`;
                } else {
                    response = 'END Invalid candidate selection';
                }
                break;
            case '1*1*2':
            case '1*2*2':
            case '1*3*2':
            case '1*4*2':
            case '2*1*2':
            case '2*2*2':
            case '2*3*2':
            case '2*4*2':
                response = 'END Thank you for using our services';
                break;
            default:
                response = 'END Invalid input';
        }
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

function getCandidateName(text) {
    const candidateCodes = text.split('*').slice(2); // Extract candidate codes
    const candidates = ['Kamanzi Eric', 'Habimana Yves', 'Itangishaka Claude', 'Umwali Aliance'];
    const candidateIndex = parseInt(candidateCodes[candidateCodes.length - 1]) - 1;
    return candidates[candidateIndex];
}

function saveVote(sessionId, serviceCode, phoneNumber, text) {
    const candidateCodes = text.split('*').slice(2); // Extract candidate codes
    const candidates = ['Kamanzi Eric', 'Habimana Yves', 'Itangishaka Claude', 'Umwali Aliance'];
    const candidateIndex = parseInt(candidateCodes[candidateCodes.length - 1]) - 1;
    const candidate = candidates[candidateIndex];
    
    if (candidate) {
        const sql = 'INSERT INTO amatora (sessionId, serviceCode, phoneNumber, text, candidate) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [sessionId, serviceCode, phoneNumber, text, candidate], (err, result) => {
            if (err) {
                console.error('Error saving vote:', err.message);
            } else {
                console.log('Vote saved successfully');
            }
        });
    } else {
        console.error('Error saving vote: Invalid candidate selection');
    }
}


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log('USSD server listening on http://localhost:' + PORT));
