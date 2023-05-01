const ser = require("./serialize.js");
const comments = ser.read('./retorts.json');

module.exports  = {
  addComment: addComment,
  getComment: getComment,
  getCommentList: getCommentList,
  handler:  [{
    label:"Retorts",
    keywords:['say something'],
    handler: getComment,
    description:"Give a random response.",
    help:"N/A"
  },
  {
    label: "List Retorts",
    keywords:['list comments','list retorts'],
    handler: getCommentList,
    description:"Get a list of Zoe's comments.",
    help:"Say \`list comments\``"
  },
  {
    label:"Add Retort",
    keywords:['add retort','add comment'],
    handler: addComment,
    description:"Add a retort to Zoe's repertoire.",
    help:"Say \`add retort <string>\`. Use \`<user>\` as a placehoder if you want Zoe to address the user."
  }]
}
                     
function saveComments(){
  ser.store(comments, './retorts.json');
}
function getCommentList(argStr, user, kw){
  return comments.join('\n');
}
function getComment(argStr, user, kw){
  // select a comment at random
  const i = Math.floor(Math.random() * comments.length);
  return `${ comments[i].replace(/<user>|&lt;user&gt;/g, '<@' + user + '>' ) }`;
  
}
async function addComment(argStr, user, kw){
  const subIndex = argStr.indexOf(kw) + kw.length;
  const new_comment = argStr.substring(subIndex).trimStart();
  comments.push(new_comment);
  saveComments();
  return `Okay, I'm adding \"${new_comment}\" to my list of responses.`;
  
}
