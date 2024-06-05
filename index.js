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
    } else if ( text == '1*1') {
        const candidate = 'Kamanzi eric';
        response = `CON Emeza gutora ${candidate}
            1. Yego
            2.Oya`;
    }else if ( text == '1*2') {
        const candidate = 'Habimana Yves';
        response = `CON Emeza gutora ${candidate}
            1. Yego
            2.Oya`;
    }else if ( text == '1*3') {
        const candidate = 'Itangishaka Claude';
        response = `CON Emeza gutora ${candidate}
            1. Yego
            2.Oya`;
    }else if ( text == '1*4') {
        const candidate = 'Umwali Aliance';
        response = `CON Emeza gutora ${candidate}
            1. Yego
            2.Oya`;
    }

    // Send the response back to the API
    res.set('Content-Type: text/plain');
    res.send(response);
});

const PORT = process.env.PORT || 3001

app.listen(PORT, ()=> console.log('ussd server listening on http://localhost:',PORT))