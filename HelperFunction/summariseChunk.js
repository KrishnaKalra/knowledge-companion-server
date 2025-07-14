import { geminiQuery } from "../ai/gemini.js";

export async function summariseChunkFunction(textChunk){
    var ans="";
    for(var i=0;i<textChunk.length;i++){
        const geminiResult=await geminiQuery(textChunk[i]);
        ans=ans+" "+geminiResult;
    }
    //console.log(ans);
    return ans;
}