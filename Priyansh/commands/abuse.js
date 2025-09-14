module.exports.config = {
  name: "abuse",
  version: "1.0.0",
  author: "Anurag Mishra",
  role: 0,
  description: "Auto abuse detection and warning system",
  category: "system",
  usages: "Auto triggers on abusive words",
  cooldowns: 0
};

const ABUSE_RESET_MS = 24 * 60 * 60 * 1000; // reset after 24h
const WARN_LIMIT = 2;
const ABUSE_WORDS = [
  "gaand","bhosdike","madarchod","bhenchod","gaandu","chutiya","chut","randi",
  "fuck","bitch","asshole","motherfucker","cunt"
];

const abuseRegex = new RegExp("\\b(?:" + ABUSE_WORDS.map(w => w.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')).join("|") + ")\\b", "i");
const warnings = new Map();

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const body = (event.body || "").toLowerCase();

    if (!body || !abuseRegex.test(body)) return;

    // ignore self
    if (senderID == api.getCurrentUserID()) return;

    // ignore admins
    const info = await api.getThreadInfo(threadID);
    if (info.adminIDs.some(e => e.id == senderID)) return;

    const key = `${threadID}_${senderID}`;
    let entry = warnings.get(key);

    if (!entry) {
      const timeoutId = setTimeout(() => warnings.delete(key), ABUSE_RESET_MS);
      entry = { count: 0, timeoutId };
      warnings.set(key, entry);
    }

    entry.count++;

    // user name
    let name = senderID;
    try {
      const uInfo = await api.getUserInfo(senderID);
      if (uInfo && uInfo[senderID]) name = uInfo[senderID].name;
    } catch (e) {}

    if (entry.count < WARN_LIMIT) {
      api.sendMessage({
        body: `@${name} ⚠️ ये भाषा यहां allowed नहीं है!\n👉 पहली चेतावनी दी जा रही है.\n\n— Credit: Anurag Mishra`,
        mentions: [{ tag: `@${name}`, id: senderID }]
      }, threadID);
    } else {
      api.sendMessage({
        body: `@${name} ❌ तुमने warning ignore कर दी, अब तुम्हें group से remove किया जा रहा है!\n\n— Credit: Anurag Mishra`,
        mentions: [{ tag: `@${name}`, id: senderID }]
      }, threadID);

      setTimeout(() => {
        try {
          if (typeof api.removeUserFromGroup === "function")
            api.removeUserFromGroup(senderID, threadID);
          else if (typeof api.removeUser === "function")
            api.removeUser(senderID, threadID);
        } catch (e) {
          api.sendMessage("⚠️ Remove नहीं कर पाया, शायद मेरे पास admin rights नहीं हैं.", threadID);
        }
      }, 800);

      clearTimeout(entry.timeoutId);
      warnings.delete(key);
    }
  } catch (err) {
    console.error("Abuse command error:", err);
  }
};

module.exports.run = async function () {
  // कोई prefix वाली run की ज़रूरत नहीं, ये auto trigger है
};
