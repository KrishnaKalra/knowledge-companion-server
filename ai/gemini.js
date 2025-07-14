const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function geminiQuery(text) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `You are an expert in summarizing and formatting educational notes.

Summarize the following content clearly and concisely:
- Use section headings with <h3> or <strong>
- Use general bullet points with <ul> and <li>
- Return the summary as clean HTML starting with a <div>
- Do NOT include <html>, <head>, or <body> tags
- Only return the HTML, nothing else

Here is the content:
${text}
`,
  });

  return response.text
    .replace(/^```html\s*/i, '')
    .replace(/```$/i, '')
    .replace(/\n/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
    .trim();
}

module.exports = { geminiQuery };
