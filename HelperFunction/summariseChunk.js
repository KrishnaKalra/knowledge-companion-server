const { geminiQuery } = require("../ai/gemini");

async function summariseChunkFunction(textChunk) {
  let ans = "";
  for (let i = 0; i < textChunk.length; i++) {
    const geminiResult = await geminiQuery(textChunk[i]);
    ans += " " + geminiResult;
  }
  return ans;
}

module.exports = { summariseChunkFunction };
