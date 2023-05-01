const util = require("./util.js");

module.exports = {
  handleDrink: handleDrink,
  handler: { 
    label: "Cocktail Search",
    keywords: ['drink', 'drinks', 'cocktail','cocktails', 'vh3'],
    handler: handleDrink,
    description: "Find cocktails and cocktail recipes.",
    help: `Say \`<keyword>\` to get a random cocktail recipe.
Say \`<keyword> by name <drink name>\` to look up a specific drink.
Say \`<keyword> by spirit <spirit name>\` for a random selection of up to five drink names using that spirit.`
  }
};


async function handleDrink(argString, user, kw) {
  const cocktail_search_hostname = "www.thecocktaildb.com";
  const cocktail_search_path = "/api/json/v1/1";

  async function lookupDrinkByName(args, user, kw) {
    const s = "by name";
    const index = args.indexOf(kw);
    const argStr = args.substring(index + kw.length).trimStart();
    const ws_result = await util.getWsResult({
      hostname: cocktail_search_hostname,
      path: `${cocktail_search_path}/search.php?s=${encodeURIComponent(argStr)}`,
    });
    
    return formatDrinkRecipe(JSON.parse(ws_result), user, false);
  }
  async function lookupDrinksBySpirit(args, user, kw) {
    const s = "by spirit ";
    const index = args.indexOf(kw);
    const argStr = args.substring(index + kw.length).trimStart();
    const ws_result = await util.getWsResult({
      hostname: cocktail_search_hostname,
      path: `${cocktail_search_path}/filter.php?i=${encodeURIComponent(argStr)}`,
    });
    let drinks = [];
    let selectedDrinks = [];
    let message = "";

    try {
      const jsonData = JSON.parse(ws_result);
      drinks = jsonData.drinks;
      const drinksShuffle = util.shuffle(drinks);

      const numItemsToSelect = 5;
      if (drinksShuffle.length > numItemsToSelect) {
        selectedDrinks = drinksShuffle.slice(0, numItemsToSelect);
      } else {
        selectedDrinks = drinksShuffle;
      }
      message += `Here are some drinks that contain *${argStr}*, <@${user}>:\n`;

      for (const drink of selectedDrinks) {
        message += `${drink.strDrink}\n`;
      }
    } catch {
      message = `I didn't find anything for *${argStr}*, <@${user}>. Sorry.`;
    }

    return message;
  }

  // Outer "handleDrink" function
  let argStr = util.stripMessage(argString);
  const handlers = {
    "by name": lookupDrinkByName,
    "by spirit": lookupDrinksBySpirit,
    "by ingredient": lookupDrinksBySpirit,
    "containing" :lookupDrinksBySpirit
  };
  let message;
  for (const s_kw in handlers) {
    if (argStr.toLowerCase().includes(s_kw)) {
      message = await handlers[s_kw](argStr, user, s_kw);
      break;
    }
  }
  if (message) {
    return message;
  }
  // if message is undefined, get a random drink
  const ws_result = await util.getWsResult({
    hostname: cocktail_search_hostname,
    path: `${cocktail_search_path}/random.php`,
  });
  return formatDrinkRecipe(JSON.parse(ws_result), user, true);
  
  function formatDrinkRecipe(jsonData, user, random = false) {
  try {
    const drink = jsonData.drinks[0];
    const matchUser = argStr.match(/<@(.*?)>/);
    const whoFor = matchUser !== null ? matchUser[1] : user;
    
    let recipe = "";
    if (random) {
      recipe += `:cocktail: Why not try a *${drink.strDrink}*, <@${whoFor}>?\n`;
    } else {
      recipe += `:cocktail: I found a *${drink.strDrink}* for you <@${whoFor}>\n`;
    }

    const ingredients = {};
    for (let i = 1; i < 16; i++) {
      const ingString = drink[`strIngredient${i}`];
      if (ingString === null) {
        break;
      }
      ingredients[ingString] = drink[`strMeasure${i}`];
    }
    for (const ingredient in ingredients) {
      recipe += `${ingredients[ingredient]} ${ingredient}\n`;
    }

    return recipe + drink.strInstructions;
  } catch {
    return "I failed to find anything";
  }
}

}
