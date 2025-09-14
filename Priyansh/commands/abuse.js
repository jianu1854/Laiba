module.exports.config = {
  name: "abuse",
  version: "1.0.0",
  role: 0,
  description: "Auto remove on abusive words",
  category: "system",
  cooldowns: 0
};

const ZERO_WIDTH_REGEX = /[\u200B-\u200F\u2028-\u202F\u205F\u2060\uFEFF]/g;

const REPLACEMENTS = {
  '＠':'@','！':'!','０':'0','１':'1','２':'2','３':'3','４':'4','５':'5','６':'6','７':'7','８':'8','９':'9',
  'Ａ':'a','Ｂ':'b','Ｃ':'c','Ｄ':'d','Ｅ':'e','Ｆ':'f','Ｇ':'g','Ｈ':'h','Ｉ':'i','Ｊ':'j','Ｋ':'k','Ｌ':'l','Ｍ':'m','Ｎ':'n','Ｏ':'o','Ｐ':'p','Ｑ':'q','Ｒ':'r','Ｓ':'s','Ｔ':'t','Ｕ':'u','Ｖ':'v','Ｗ':'w','Ｘ':'x','Ｙ':'y','Ｚ':'z',
  'ａ':'a','ｂ':'b','ｃ':'c','ｄ':'d','ｅ':'e','ｆ':'f','ｇ':'g','ｈ':'h','ｉ':'i','ｊ':'j','ｋ':'k','ｌ':'l','ｍ':'m','ｎ':'n','ｏ':'o','ｐ':'p','ｑ':'q','ｒ':'r','ｓ':'s','ｔ':'t','ｕ':'u','ｖ':'v','ｗ':'w','ｘ':'x','ｙ':'y','ｚ':'z',
  'ɑ':'a','а':'a','α':'a','е':'e','і':'i','ɪ':'i','ο':'o','ѕ':'s','$':'s','§':'s',
  '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','2':'z','9':'g',
  '@':'a','$':'s','!':'i'
};

function escapeRegex(s){ return s.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&'); }
const REPL_REGEX = new RegExp(Object.keys(REPLACEMENTS).map(escapeRegex).join("|"), "g");

const ABUSE_WORDS = [
  "gaand","bhosdike","madarchod","bhenchod","gaandu","chutiya","chut","randi",
  "fuck","bitch","asshole","motherfucker","cunt"
];
const normalizedAbuse = ABUSE_WORDS.map(w => normalizeText(w));
const ABUSE_REGEX = new RegExp("\\b(?:" + normalizedAbuse.map(escapeRegex).join("|") + ")\\b", "i");

function normalizeText(str=""){
  let s = str.replace(ZERO_WIDTH_REGEX,"");
  s = s.normalize("NFKD").replace(REPL_REGEX, m=>REPLACEMENTS[m]||m);
  s = s.replace(/[\u0300-\u036f]/g,"");
  s = s.replace(/[^\p{L}\p{N} ]/gu," ").toLowerCase().trim();
  return s.replace(/\s+/g," ");
}

async function tryRemove(api, threadID, userID){
  try { await api.removeUserFromGroup(userID, threadID); return true; } catch(e){}
  try { await api.removeUserFromGroup(threadID, userID); return true; } catch(e){}
  try { await api.removeUser(userID, threadID); return true; } catch(e){}
  try { await api.removeUserFromThread(userID, threadID); return true; } catch(e){}
  return false;
}

async function isAdmin(api, threadID, userID){
  try {
    const info = await api.getThreadInfo(threadID);
    const admins = info.adminIDs || [];
    return admins.some(a => (typeof a==="object"?a.id:userID)==userID);
  } catch(e){ return false; }
}

module.exports.handleEvent = async function({ api, event }){
  const threadID = event.threadID;
  const senderID = event.senderID;
  const body = (event.body||"").toString();
  if(!body) return;

  if(api.getCurrentUserID && senderID==api.getCurrentUserID()) return;
  if(await isAdmin(api, threadID, senderID)) return;

  const norm = normalizeText(body);
  if(!ABUSE_REGEX.test(norm)) return;

  try {
    const userInfo = await api.getUserInfo(senderID);
    const name = userInfo?.[senderID]?.name || "User";
    await api.sendMessage({
      body: `${name}, abusive language not allowed. You are being removed.`,
      mentions: [{tag:name, id:senderID}]
    }, threadID);
    setTimeout(async ()=>{ await tryRemove(api, threadID, senderID); }, 1000);
  } catch(e){ console.error(e); }
};

module.exports.run = ()=>{};
