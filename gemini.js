
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing from your environment.");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateFinancialInsights(financialData) {
    const prompt = `
You are Finora, a personal finance insights assistant.

Analyze the following financial data and provide:
1. A brief summary of spending and income.
2. The categories with the highest expenses.
3. Any budget concerns.
4. Three practical suggestions for improving financial habits.

Use clear, friendly language.
Only make claims supported by the supplied data.
Do not invent missing information.
Do not claim to be a certified financial advisor.

Financial data:
${JSON.stringify(financialData, null, 2)}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt
    });

    return response.text;
}

module.exports = { generateFinancialInsights };
