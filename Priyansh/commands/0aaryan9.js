const fs = require("fs");
module.exports.config = {
  name: "angry",
    version: "1.0.1",
  hasPermssion: 0,
  credits: "VanHung - Fixed by LTD", 
  description: "hihihihi",
  commandCategory: "no prefix",
  usages: "🙂",
    cooldowns: 5, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
  var { threadID, messageID } = event;
  if (event.body.indexOf("😡")==0 || event.body.indexOf("🤬")==0 || event.body.indexOf("😠")==0 || event.body.indexOf("😤")==0) {
    var msg = {
        body: "💐क्या यार जब देखो गुस्सा करते रहते हो लो जूस 🧃 पिलो मेरे साथ दिमाग कूल रहेगा 💐",
      }
      api.sendMessage( msg, threadID, messageID);
    api.setMessageReaction("😕", event.messageID, (err) => {}, true)
    }
  }
  module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
