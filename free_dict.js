const util = require("./util.js");
module.exports = {
  lookupWord: lookupWord,
  handler: { 
    label: "Word Search",
    keywords: ['lookup word', 'lookup the word'],
    handler: lookupWord,
    description: "Search dictionaryapi.dev for a word.",
    help: `Say \`lookup word <word>\` to search for a definition.`
  }
}

async function lookupWord(argStr, user, kw){
  const str_end = argStr.substring(argStr.indexOf(kw) + kw.length + 1);
  const word = str_end.split(/\s+/)[0];
  const ws_result = await util.getWsResult({
      hostname: 'api.dictionaryapi.dev',
      path: `/api/v2/entries/en/${word}`
    });
  try{
    const jsonData = JSON.parse(ws_result);
    let msg = `*${jsonData[0].word}*\n`;
    const meanings = jsonData[0].meanings;
    let num = 1;
    for (const m of meanings.slice(0,3)){
      for (const def of m.definitions.slice(0,3)){
        msg += `${num++}) _${m.partOfSpeech}_ ${def.definition}\n`;
      }  
    }
    return msg;  
  }
  catch(err){
    console.log(err);
    return "twas an error";
  }
  
}
