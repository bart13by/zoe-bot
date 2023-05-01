const util = require("./util.js");

module.exports = {
  handleShots: handleShots,
  handler:{
    label:"ABV to Shots",
    keywords:['shots'],
    handler: handleShots,
    description: "Convert ABV pct to number of shots for a given volume of alcoholic drink.",
    help: "Say \`shots <vol> <oz || ml> <pct> abv\`; eg, \`how many shots in 12 oz of 5% abv beer?\`"
  }
}

async function handleShots(argString, user, kw) {
  // how many shots in 12 oz of 5% abv
  let decVolume = 0;
  let strVolUnits = "oz";
  let pctABV = 0;
  argString = argString.replace(/\%/g, "");
  const args = argString.split(/\s+/g);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (["oz", "ml"].includes(arg)) {
      strVolUnits = arg;
      decVolume = args[i - 1];
    }
    if (arg.toLowerCase().includes("abv")) {
      pctABV = args[i - 1];
      console.log(pctABV);
    }
  }
  const payload = JSON.stringify({
    data: {
      decVolume: decVolume,
      strVolUnits: strVolUnits,
      pctABV: pctABV,
    },
  });
  const ws_result = await util.getWsPostResult(
    {
      hostname: "abv-to-shots-ws.onrender.com",
      path: "/getshots",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length,
      },
    },
    payload
  );
  const jsonData = JSON.parse(ws_result);
  const mlShots = jsonData.data.numMlShots;
  const ozShots = jsonData.data.numOzShots;

  //  return JSON.stringify(ws_result);
  return `<@${user}> ${decVolume} ${strVolUnits} of a ${pctABV}% drink is *${mlShots}* 50 ml shots, or *${ozShots}* 1.5 oz shots.`;
}