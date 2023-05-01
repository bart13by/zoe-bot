const { App } = require("@slack/bolt");
const store = require("./store");
const https = require("https");
const util = require("./util.js");

/* Load handler modules */
const drinks = require("./cocktail.js");
const shots = require("./shots.js");
const nutrition = require("./nutrition.js");
const retort = require("./retort.js");
const swear = require("./swear.js");
const dict = require("./free_dict.js");
/*   
 * Each handler module is responsible for exporting a "handler" object that binds the handler to a method.
 * Handler methods must be async and accept the following arguments:
 *   String argString: the full event.text passed by slack
 *   UserID user: the Slack user who mentioned @zoe
 *   String kw: the keyword that caused the handler to be invoked.
 *
 * Handler methods must return an object with a 'message' property that should contain a string 
 * formatted for zoe to "say()"
 *
 * If a module has more than one handler method, the "handler" object should be a list of objects, one for
 * each handler method. Obviously, the module must also export the handler method(s)
 *
 */
const handlers = [
    {
      label:"Help",
      keywords:['--help'],
      handler: getHelp,
      description:"Say \`--help\` to get general help or \`--help <keyword>\` to get handler-specific help"
    }
  ]// we concat these to support lists of handlers in the modules (see "retorts")
    .concat(retort.handler)
    .concat(drinks.handler)
    .concat(shots.handler)
    .concat(nutrition.handler)
    .concat(swear.handler)
    .concat(dict.handler);

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

/* =========================== HELP (is just a handler) ==================== */
async function getHelp(argStr, user, kw) {
  /* Begin new help handler*/
  let ret = "";
  outerloop:
  for (const handler of handlers){
    let h_template =`
*Name:* ${handler.label}
*Description:* ${handler.description}
*Keywords:* ${handler.keywords.join(', ')}`;
    innerloop:
    for (const word of handler.keywords){
      if (word === kw){ //skip --help, because that's us
        break innerloop;
      }
      
      if (argStr.toLowerCase().includes(word)){
        h_template += `\n*Help:* ${handler.help}`;
        return h_template;
      }
    }
    h_template += "\n===============================================\n";
    ret += h_template;
  }
  return ret;
}

// Mentions
app.event("app_mention", async ({ event, say }) => {
  let user = util.lookupUser(event);
  let argString = event.text;
  let message;
  outerloop:
  for (const handler of handlers){
    for (const kw of handler.keywords){
      if (argString.toLowerCase().includes(kw)){
        message = await handler.handler(argString, user, kw)
        break outerloop;
      }
    }
  }
  
  if (!message) {
    message = await retort.getComment(argString, user, '');
  }

  await say(message);
});


// someone DM'ing me
app.event("app_home_opened", async ({ event, say }) => {
  // Look up the user from DB
  let user = store.getUser(event.user);

  if (!user) {
    user = {
      user: event.user,
      channel: event.channel,
    };
    store.addUser(user);
    user = user.user; // this is some fuckshit from the tutorial
  }
  await say(`Hello world, and welcome <@${user}>!`);
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  const botUserId = await app.client.auth.test().then(({ user_id }) => user_id);
  console.log(`Bot user ID: ${botUserId}`);
  store.setMe(botUserId);
  console.log("⚡️ Bolt app is running!");
})();

