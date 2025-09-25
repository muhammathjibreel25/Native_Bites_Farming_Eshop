// routes/geminiRoutes.js (ES Module - Chatbot Logic)

import express from 'express';
const router = express.Router();

// ------------------------------------------
// 1. Configure the Google Gen AI SDK
// ------------------------------------------
import { GoogleGenAI } from "@google/genai"; 
// Uses the GEMINI_API_KEY from your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The model we will use for simple text chat
const model = "gemini-2.5-flash"; 

// ------------------------------------------
// 2. Define the Chatbot Endpoint
// ------------------------------------------
router.post('/chat', async (req, res) => {
    const { prompt } = req.body;

    // Basic validation
    if (!prompt) {
        return res.status(400).json({ error: "Missing 'prompt' in request body." });
    }

    try {
        // Send the user's prompt to the Gemini API
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        const chatResponse = response.text.trim();

        res.json({ 
            success: true, 
            response: chatResponse 
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to communicate with the AI model." 
        });
    }
});

export default router;