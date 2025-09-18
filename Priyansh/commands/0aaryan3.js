const fs = require("fs");
module.exports.config = {
	name: "loveyou2",
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
	if (event.body.indexOf("😍")==0 || event.body.indexOf("😻")==0 || event.body.indexOf("❤️")==0 || event.body.indexOf("🤗")==0) {
		var msg = {
				body: "💐आँखों मे प्यार, दिल है बीमार, मै हूँ इश्क़ का डॉक्टर सिर्फ तुम्हारे लिए यार🫂💐",
			}
			api.sendMessage( msg, threadID, messageID);
    api.setMessageReaction("🙈", event.messageID, (err) => {}, true)
		}
	}
	module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
