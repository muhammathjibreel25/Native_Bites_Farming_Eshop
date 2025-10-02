// Backend/server.js (ES Module Entry Point for Chatbot)

import 'dotenv/config'; // Loads .env variables
import express from 'express';
import cors from 'cors'; 
import { GoogleGenAI } from "@google/genai"; // Correct package name

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Define the System Instruction
// This instruction forces the model to use only plain text, solving the 'star' and emoji issues.
const PLAIN_TEXT_INSTRUCTION = "You are a helpful assistant. Provide all responses in plain, unformatted text only. DO NOT use any Markdown formatting characters such as *, #, or _, and DO NOT include any emojis.";

// 2. Initialize the Gemini Client
// Key is automatically picked up from process.env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
const model = "gemini-2.5-flash"; 

// 3. Middleware
app.use(express.json()); // To parse JSON bodies (for the prompt)
app.use(cors());         // To fix connection issues with the frontend

// Basic root path check
app.get('/', (req, res) => {
    res.send('Gemini Node Server is running. Use the /api/chat endpoint.');
});

// 4. Chatbot API Endpoint (POST /api/chat)
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Missing 'prompt' in request body." });
    }

    try {
        console.log(`Received prompt: ${prompt}`);

        // 💡 FIX APPLIED HERE: Injecting PLAIN_TEXT_INSTRUCTION into the API configuration
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: PLAIN_TEXT_INSTRUCTION
            }
        });

        const chatResponse = response.text.trim();

        res.json({ 
            success: true, 
            response: chatResponse 
        });

    } catch (error) {
        // Log the error detail on the server side for debugging API key or network issues
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ 
            success: false, 
            error: "Failed to communicate with the AI model. Check server console for details (often a bad API key)." 
        });
    }
});


// 5. Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
