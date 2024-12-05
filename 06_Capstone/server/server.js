require('dotenv').config();
const OPENAI_KEY = process.env.OPENAI_KEY;
const GPT_URL = process.env.GPT_URL;
const fetch = require('node-fetch');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//Allow all requests from all domains & localhost
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function (req, res) {
    res.send("Hello World!");
});

app.post('/gpt', async function (req, res) {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({error: 'Message is required'});
    }

    try {
        const response = await fetch(GPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{role: "user", content: userMessage}]
            })
        });
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({error: data.error.message});
        }

        res.json({reply: data.choices[0].message.content});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// Start the server
const PORT = process.env.PORT || 6069;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});