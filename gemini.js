
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

async function chatWithFinora(
    message,
    conversationHistory = [],
    financialContext = {}
) {
    const contents = [
        ...conversationHistory.slice(-10),
        {
            role: "user",
            parts: [{
                text: `You are Finora, a friendly personal finance assistant.

Keep answers concise and conversational, usually 2–5 sentences.
Use simple English and answer the exact question first.

You may use the financial summary below to answer questions about the user's finances.
- Use only the supplied data for claims about the user's financial situation.
- If a value is missing, say you don't have that information.
- Do not assume that all remaining income is available to invest.
- Explain investment risks briefly when relevant.
- Never promise returns or claim an investment is guaranteed.
- Do not claim to be a certified financial advisor.
- Explain trade-offs rather than making definitive investment decisions.
- Do not invent current prices, interest rates, or market data.
- For follow-up questions, use the conversation history.
- For questions outside personal finance, politely guide the user back to finance topics.

User's financial summary:
${JSON.stringify(financialContext, null, 2)}

User's current question:
${message}`
            }]
        }
    ];

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-3.8-flash",
                contents
            });

            return response.text;
        } catch (error) {
            const errorText = String(error.message || error);
            const temporaryError =
                /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|500|502|504/i.test(errorText);

            if (!temporaryError || attempt === 3) {
                throw error;
            }

            await new Promise(resolve =>
                setTimeout(resolve, attempt * 1500)
            );
        }
    }
}




module.exports = {
    generateFinancialInsights,
    chatWithFinora
};
