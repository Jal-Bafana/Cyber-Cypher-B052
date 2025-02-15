const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

// Serve static files from 'public' folder
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Chatbot API route
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: userMessage }] }]
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );

        const botResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure, can you clarify?";
        res.json({ reply: botResponse });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({ reply: 'Error connecting to AI service' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
