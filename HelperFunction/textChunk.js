export function textChunkFunction(resultText){
    const words = resultText.trim().split(/\s+/);
    const textChunk=[];
    for(let i=0;i<words.length;i+=1000){
        textChunk.push(words.slice(i,Math.min(i+1000),words.length).join(' '));
    }
    return textChunk;
}