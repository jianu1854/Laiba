module.exports.config = {
	name: "admin",
	version: "1.0.1", 
	hasPermssion: 0,
	credits: "JAMAL PATHAN",
	description: "Admin.",
	commandCategory: "...",
	cooldowns: 1,
	dependencies: 
	{
    "request":"",
    "fs-extra":"",
    "axios":""
  }
};
module.exports.run = async function({ api,event,args,client,Users,Threads,__GLOBAL,Currencies }) {
const axios = global.nodemodule["axios"];
const request = global.nodemodule["request"];
const fs = global.nodemodule["fs-extra"];
const time = process.uptime(),
		hours = Math.floor(time / (60 * 60)),
		minutes = Math.floor((time % (60 * 60)) / 60),
		seconds = Math.floor(time % 60);
const moment = require("moment-timezone");
var juswa = moment.tz("Asia/Dhaka").format("『D/MM/YYYY』 【HH:mm:ss】");
var link =                                     
["https://i.imgur.com/Kj2CmiZ.jpegv"];
var callback = () => api.sendMessage({body:`
┏━━━✦❘༻༺❘✦━━━┓
   ⚡ 𝐁𝐎𝐓 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 𝐏𝐀𝐍𝐄𝐋 ⚡
┗━━━✦❘༻༺❘✦━━━┛

🖥 𝗕𝗼𝘁 ➤ ${global.config.BOTNAME}  
👑 𝗢𝘄𝗻𝗲𝗿 ➤ 𝗝𝗔𝗠𝗔𝗟 𝗣𝗔𝗧𝗛𝗔𝗡 👑  
🛠 𝗠𝗼𝗱𝗲 ➤ [ 𝐏𝐫𝐨 𝐕𝐞𝐫𝐬𝐢𝐨𝐧 🌀 ]  

🔐 𝗛𝗮𝗰𝗸𝗲𝗿 𝗔𝗰𝗰𝗲𝘀𝘀 𝗟𝗼𝗴:  
[✔] Root Access ✅  
[✔] Database Linked 🗄  
[✔] Social Media Injected 🌐  

🌐 𝗟𝗜𝗡𝗞𝗦 🔗  
📘 Facebook ➤ fb.com/https://www.facebook.com/share/16vptBjxyx/ 
📸 Instagram ➤ instagram.com/https://www.instagram.com/jamal972740?igsh=MWNpbDFnMzYyM3p5Nw==  
🐦 Twitter ➤ twitter.com/jamal_ji  
🎶 TikTok ➤ tiktok.com/@jamal_01  
📡 Telegram ➤ t.me/jamal_ji  

📅 𝗗𝗮𝘁𝗲 ➤ ${juswa}  
⏳ 𝗨𝗽𝘁𝗶𝗺𝗲 ➤ ${hours}:${minutes}:${seconds}  

💀 STATUS: RUNNING 🔥  
┏━━━✦❘༻༺❘✦━━━┓
   𝐓𝐇𝐀𝐍𝐊𝐒 𝐅𝐎𝐑 𝐔𝐒𝐈𝐍𝐆 𝐉𝐀𝐌𝐀𝐋 𝐁𝐎𝐓
┗━━━✦❘༻༺❘✦━━━┛


`,attachment: fs.createReadStream(__dirname + "/cache/juswa.jpg")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/juswa.jpg")); 
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/juswa.jpg")).on("close",() => callback());
   };
   
