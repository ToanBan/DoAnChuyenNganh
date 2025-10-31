const { GoogleGenAI } = require('@google/genai')

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_APIKEY });


const generateChatbotResponse = async (req, res) => {

    const { prompt } = req.body;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        temperature: 0.2,
        maxOutputTokens: 200,
    });
  

    let text = response?.response?.text() || response?.text || "";
    const firstBracket = text.indexOf("[");
    const lastBracket = text.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1) {
        text = text.slice(firstBracket, lastBracket + 1);
    }
 
    return res.json({ message: text });
}

module.exports = {
    generateChatbotResponse,
};
