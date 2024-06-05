const express = require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get("/api/test", function(req,res){
    res.send("test request");
})

app.post('/ussd', (req, res) => {
    // Read the variables sent via POST from our API
    const {
        sessionId,
        serviceCode,
        phoneNumber,
        text,
    } = req.body;

    let response = '';
    let candidate = '';

    if (text == '') {
        // This is the first request. Note how we start the response with CON
        response = `CON Welcome to voting system!
            Murakaza neza kurubuga rw'amatora!
        1. Kinyarwanda
        2. English`;
    } else if ( text == '1') {
        // Business logic for first level response
        response = `CON Hitamo Umukandida
        1. Kamanzi Eric;
        2. Habimana Yves;
        3. Itangishaka Claude;
        4. Umwali Aliance`;
    } else if ( text == '2') {
        response = `CON Select candidate
        1. Kamanzi Eric;
        2. Habimana Yves;
        3. Itangishaka Claude;
        4. Umwali Aliance`;

        //FOR KINYARWANDA LANGUAGE
    } else if ( text == '1*1') {
        candidate = 'Kamanzi eric';
        response = `CON Emeza gutora ${candidate}
            1.Yego
            2.Oya`;
    }else if ( text == '1*2') {
        candidate = 'Habimana Yves';
        response = `CON Emeza gutora ${candidate}
            1.Yego
            2.Oya`;
    }else if ( text == '1*3') {
        candidate = 'Itangishaka Claude';
        response = `CON Emeza gutora ${candidate}
            1.Yego
            2.Oya`;
    }else if ( text == '1*4') {
        candidate = 'Umwali Aliance';
        response = `CON Emeza gutora ${candidate}
            1.Yego
            2.Oya`;

    //FOR ENGLISH USERS
    }else if ( text == '2*1') {
        candidate = 'Kamanzi eric';
        response = `CON Confirm to vote ${candidate}
            1.Yes
            2.No`;
    }else if ( text == '2*2') {
        candidate = 'Habimana Yves';
        response = `CON Confirm to vote ${candidate}
            1.Yes
            2.No`;
    }else if ( text == '2*3') {
        candidate = 'Itangishaka Claude';
        response = `CON Confirm to vote ${candidate}
            1.Yes
            2.No`;
    }else if ( text == '2*4') {
        candidate = 'Umwali Aliance';
        response = `CON Confirm to vote ${candidate}
            1.Yes
            2.No`;

            //VOTING (YES) IN KINYARWANDA
    }else if(text == '1*1*1'){
        candidate = 'Kamanzi eric';
        response = `END Gutora ${candidate} Byakunze!`;
    }else if(text == '1*1*1'){
        candidate = 'Kamanzi eric';
        response = `END Gutora ${candidate} Byakunze!`;
    }else if(text == '1*1*1'){
        candidate = 'Kamanzi eric';
        response = `END Gutora ${candidate} Byakunze!`;
    }else if(text == '1*1*1'){
        candidate = 'Kamanzi eric';
        response = `END Gutora ${candidate} Byakunze!`;
    }
     //VOTING (YES) IN ENGLISH

    else if(text == '2*1*1'){
        candidate = 'Kamanzi eric';
        response = `END Voting ${candidate} successful!`;
    }else if(text == '2*1*1'){
        candidate = 'Kamanzi eric';
        response = `END Voting ${candidate} successful!`;
    }else if(text == '2*1*1'){
        candidate = 'Kamanzi eric';
        response = `END Voting ${candidate} successful!`;
    }else if(text == '2*1*1'){
        candidate = 'Kamanzi eric';
        response = `END Voting ${candidate} successful!`;
    }
//IF USER SELECTED NO
else if(text == '1*1*2' || text == '1*2*2' || text == '1*3*2' || text == '1*4*2' || text == '2*1*2' || text == '2*2*2' || text == '2*3*2' || text == '2*4*2'){
    text = '';
}

    // Send the response back to the API
    res.set('Content-Type: text/plain');
    res.send(response);
});

const PORT = process.env.PORT || 3001

app.listen(PORT, ()=> console.log('ussd server listening on http://localhost:',PORT))