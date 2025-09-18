const fs = require("fs");
module.exports.config = {
  name: "lough",
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
  if (event.body.indexOf("😁")==0 || event.body.indexOf("😅")==0 || event.body.indexOf("😄")==0 || event.body.indexOf("😃")==0) {
    var msg = {
        body: "💐इतनी हसी क्यों आ रही है मुझे बताओ किया राज़ है इस हसी के पीछा मै भी जानू इस हसी का राज़ 💐",
      }
      api.sendMessage( msg, threadID, messageID);
    api.setMessageReaction("😀", event.messageID, (err) => {}, true)
    }
  }
  module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
