const https = require("https");
const store = require('./store.js');

module.exports = {
  shuffle: shuffle,
  lookupUser: lookupUser,
  stripMessage: stripMessage,
  getWsResult: getWsResult,
  getWsPostResult: getWsPostResult
}

function shuffle(array) {
  /* Implement Fisher-yates shuffle algorithm for arrays.*/
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function lookupUser(event) {
  /* This came with the Hello World sample code */
  let user = store.getUser(event.user);
  if (!user) {
    user = {
      user: event.user,
      channel: event.channel,
    };
    store.addUser(user);
  }
  return user.user;
}

function stripMessage(text) {
  /* strip my user name as well as punctuation, 
   * but leave any other user names in case the 
   * handler wants to use them 
   */

  const me = store.getMe();
  const me_pattern = new RegExp(`<@${me}>`);
  return text.replace(me_pattern, "").replace(/[^\w@<>]/g, " ");
  
}

/* =================== Handle Web Service Requests/responses ========= */
function getWsResult(options) {
  /* Call a GET web service with options and return the results */
  const chunks = [];
  return new Promise((resolve, reject) => {
    https.get(options, (response) => {
      response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      response.on("error", (err) => reject(err));
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
  });
}
function getWsPostResult(options, payload) {
  /* Call a POST web service with options and return the results */
  const chunks = [];
  return new Promise((resolve, reject) => {
    const req = https.request(options, (response) => {
      response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      response.on("error", (err) => reject(err));
      response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
    req.write(payload);
    req.end();
  });
}
