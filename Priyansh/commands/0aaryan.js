const fs = require("fs");
module.exports.config = {
  name: "sosad",
    version: "1.0.1",
  hasPermssion: 0,
  credits: "VanHung - Fixed by LTD", 
  description: "hihihi",
  commandCategory: "no prefix",
  usages: "🙂",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
  var { threadID, messageID } = event;
  if (event.body.indexOf("😢")==0 || event.body.indexOf("😭")==0 || event.body.indexOf("😔")==0 || event.body.indexOf("🥺")==0) {
    var msg = {
        body: "💐क्या हुआ बाबू उदास क्यों हो मै हूँ ना मेली जान 💐",
      }
      api.sendMessage( msg, threadID, messageID);
    api.setMessageReaction("😥", event.messageID, (err) => {}, true)
    }
  }
  module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
