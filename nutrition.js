const util = require("./util.js");
module.exports = {
  handleNutrition: handleNutrition,
  handler: {
    label:"Nutrition Lookup",
    keywords:['calories','protein','cholesterol', 'sodium','nutrition'],
    handler: handleNutrition,
    description:"Lookup nutrition information for a food item.",
    help: `Say \`<keyword> in <food item>\` to get the <keyword> nutrition value for the food item.
Keyword \`nutrition\` returns the full nutrition list.
E.G., \`How many colories in spinach\` or \`How much protein in 150g of haddock\` `
  }
}

async function handleNutrition(argString, user, kw) {
  argString = util.stripMessage(argString);
  const filter_lst = ['in', 'label', 'for', 'information','info'];
  const words = argString.split(/\s/);
  const args = words.slice(words.findIndex(i => i === kw) + 1);
  const filtered_args = args.filter(i => !filter_lst.includes(i.toLowerCase()));
  const food = filtered_args.join(" ");
  
  const payload = JSON.stringify({ query: food });
  const ws_result = await util.getWsPostResult(
    {
      hostname: "trackapi.nutritionix.com",
      path: "/v2/natural/nutrients",
      method: "POST",
      headers: {
        "x-app-id": process.env.NUTRITION_APP_ID,
        "x-app-key": process.env.NUTRITION_APP_KEY,
        "Content-Type": "application/json",
      },
    },
    payload
  );
    function getNutritionLabel(d){//nested function
      return `*Nutrition information for ${d.food_name}:* \`\`\`
  Serving:     ${d.serving_qty} ${d.serving_unit} (${d.serving_weight_grams}g)
  Calories:    ${d.nf_calories}
  Total fat:   ${d.nf_total_fat}g
  Sat. fat:    ${d.nf_saturated_fat}g
  Cholesterol: ${d.nf_cholesterol}g
  Sodium:      ${d.nf_sodium}g
  Carbs:       ${d.nf_total_carbohydrate}g
  Fiber:       ${d.nf_dietary_fiber}g
  Sugars:      ${d.nf_sugars}g
  Protein:     ${d.nf_protein}g\`\`\``
  }

  const result = JSON.parse(ws_result).foods[0];
  if (kw == "nutrition"){
    return getNutritionLabel(result);
  }
  
  const unit = (kw == 'calories') ? '' : ' g';
  const food_name = result.food_name;
  const servings = result.serving_qty;
  const serving_unit = result.serving_unit;
  const serving_weight = result.serving_weight_grams;
  const ret_value = result[`nf_${kw}`];
  return `${servings} ${serving_unit} (${serving_weight} g) ${food_name} contains ${ret_value}${unit} ${kw}`;
}
