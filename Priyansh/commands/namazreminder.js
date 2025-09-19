const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "namazReminder",
  version: "2.1",
  hasPermssion: 0,
  credits: "CYBER BOT TEAM (Translated by ChatGPT)",
  description: "Reminds you for every prayer",
  commandCategory: "islamic",
  countDown: 3
};

module.exports.run = async ({ api }) => {
  const prayerTimes = {
    "05:35 AM": { message: "✨ Fajr azan has started, everyone get ready for namaz.", url: "https://drive.google.com/uc?id=FILE_ID_1" },
    "01:00 PM": { message: "✨ Zuhr azan has started, everyone get ready for namaz.", url: "https://drive.google.com/uc?id=FILE_ID_2" },
    "04:30 PM": { message: "✨ Asr azan has started, everyone get ready for namaz.", url: "https://drive.google.com/uc?id=FILE_ID_3" },
    "07:05 PM": { message: "✨ Maghrib azan has started, everyone get ready for namaz.", url: "https://drive.google.com/uc?id=FILE_ID_4" },
    "08:15 PM": { message: "✨ Isha azan has started, everyone get ready for namaz.", url: "https://drive.google.com/uc?id=FILE_ID_5" }
  };

  let lastSent = null;

  async function getAudio(url, filename) {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, response.data);
    }
    return fs.createReadStream(filePath);
  }

  async function checkAndSend() {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).trim();

    if (prayerTimes[now] && lastSent !== now) {
      try {
        const audio = await getAudio(prayerTimes[now].url, `${now.replace(/[: ]/g, "_")}.mp3`);

        global.data.allThreadID.forEach(threadID => {
          api.sendMessage(
            {
              body: prayerTimes[now].message,
              attachment: audio
            },
            threadID
          );
        });

        lastSent = now;

      } catch (error) {
        console.error("❌ Problem while sending message:", error.message);
      }
    }

    setTimeout(checkAndSend, 60 * 1000);
  }

  checkAndSend();
};
