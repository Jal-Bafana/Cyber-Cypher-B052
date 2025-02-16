const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const marked = require('marked');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const userConversations = {};

app.post('/chat', async (req, res) => {
    const userId = req.body.userId || "defaultUser";
    const userMessage = req.body.message;

    if (!userMessage) return res.status(400).json({ reply: "Invalid message" });

    if (!userConversations[userId]) {
        userConversations[userId] = [{ role: "system", text: "You are a startup mentor AI..." }];
    }

    userConversations[userId].push({ role: "user", text: userMessage });

    try {
        const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            contents: [{ role: "user", parts: [{ text: userMessage }] }]
        }, { headers: { 'Content-Type': 'application/json' } });

        const rawText = response.data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "I didn't understand that.";
        const formattedText = marked.parse(rawText);

        res.json({ reply: formattedText });
    } catch (error) {
        console.error("AI API Error:", error.response?.data || error.message);
        res.status(500).json({ reply: "Error: AI service is unreachable." });
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
