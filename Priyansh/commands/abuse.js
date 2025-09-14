module.exports.config = {
  name: "abuse",
  version: "1.1.0",
  author: "Anurag Mishra",
  role: 0,
  description: "Auto abuse detection with unicode/air-font/homoglyph normalization and evasion-ban",
  category: "system",
  usages: "Auto triggers on abusive words (including obfuscated fonts)",
  cooldowns: 0
};

const ABUSE_RESET_MS = 24 * 60 * 60 * 1000; // warnings reset after 24h
const WARN_LIMIT = 2; // first warn, second -> kick
const BAN_ON_EVASION = true; // if normalized text reveals abuse that original didn't, ban immediately

// base abusive words (expand as needed)
const ABUSE_WORDS = [
  "gaand","bhosdike","madarchod","bhenchod","gaandu","chutiya","chut","randi",
  "fuck","bitch","asshole","motherfucker","cunt"
];

// warning messages (customize)
const WARN_MESSAGES = [
  (name) => `@${name} — ⚠️ ये भाषा यहाँ स्वीकार्य नहीं है। यह तुम्हारी पहली चेतावनी है. अगली बार नियम न मानने पर तुम्हें ग्रुप से निकाल दिया जाएगा.\n\n— Credit: Anurag Mishra`,
  (name) => `@${name} — ❌ दूसरी चेतावनी! तुम ग्रुप से निकाल दिए जा रहे हो क्योंकि नियम तोड़े गए।\n\n— Credit: Anurag Mishra`
];

// Common zero-width / invisible characters to strip
const ZERO_WIDTH_REGEX = /[\u200B-\u200F\u2028-\u202F\u205F\u2060\uFEFF]/g;

// Homoglyph + diacritic map (partial but extensive — add more as needed)
const HOMOGLYPH_MAP = {
  // latin-like
  '𝐚':'a','𝐛':'b','𝐜':'c','𝐝':'d','𝐞':'e','𝐟':'f','𝐠':'g','𝐡':'h','𝐢':'i','𝐣':'j','𝐤':'k','𝐥':'l','𝐦':'m','𝐧':'n','𝐨':'o','𝐩':'p','𝐪':'q','𝐫':'r','𝐬':'s','𝐭':'t','𝐮':'u','𝐯':'v','𝐰':'w','𝐱':'x','𝐲':'y','𝐳':'z',
  'Ａ':'a','Ｂ':'b','Ｃ':'c','Ｄ':'d','Ｅ':'e','Ｆ':'f','Ｇ':'g','Ｈ':'h','Ｉ':'i','Ｊ':'j','Ｋ':'k','Ｌ':'l','Ｍ':'m','Ｎ':'n','Ｏ':'o','Ｐ':'p','Ｑ':'q','Ｒ':'r','Ｓ':'s','Ｔ':'t','Ｕ':'u','Ｖ':'v','Ｗ':'w','Ｘ':'x','Ｙ':'y','Ｚ':'z',
  'ａ':'a','ｂ':'b','ｃ':'c','ｄ':'d','ｅ':'e','ｆ':'f','ｇ':'g','ｈ':'h','ｉ':'i','ｊ':'j','ｋ':'k','ｌ':'l','ｍ':'m','ｎ':'n','ｏ':'o','ｐ':'p','ｑ':'q','ｒ':'r','ｓ':'s','ｔ':'t','ｕ':'u','ｖ':'v','ｗ':'w','ｘ':'x','ｙ':'y','ｚ':'z',
  // common tricks
  'ɑ':'a','α':'a','а':'a', // cyrillic a
  'е':'e','е':'e','є':'e','ε':'e', // cyrillic/greek
  'і':'i','ɪ':'i','Ι':'i','ⅼ':'l',
  'ο':'o','ο':'o','ο':'o','ō':'o',
  'ѕ':'s','$':'s','§':'s',
  'ɡ':'g','ɣ':'y',
  'н':'h','һ':'h',
  'р':'p','ρ':'p',
  'к':'k',
  'т':'t',
  // numerals as letters
  '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','2':'z','9':'g'
};

// leet replacements (common)
const LEET_MAP = {
  '@':'a','4':'a','8':'b','3':'e','1':'i','!':'i','$':'s','5':'s','7':'t','0':'o'
};

// build combined replacement map
const REPLACEMENTS = Object.assign({}, HOMOGLYPH_MAP);
Object.keys(LEET_MAP).forEach(k => REPLACEMENTS[k] = LEET_MAP[k]);

// create a regex to replace any mapped char quickly
const REPL_CHARS = Object.keys(REPLACEMENTS).map(c => escapeForRegex(c)).join("|");
const REPL_REGEX = new RegExp(REPL_CHARS, "g");

// utility to escape regex special chars
function escapeForRegex(s){ return s.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&'); }

// normalize text: lowercase, remove zero-width, map homoglyphs/leets, remove diacritics
function normalizeText(input){
  if(!input) return "";
  // 1) remove zero-width/invisible
  let s = input.replace(ZERO_WIDTH_REGEX, "");
  // 2) Unicode normalize
  s = s.normalize ? s.normalize("NFKD") : s;
  // 3) replace mapped chars (homoglyphs + leet)
  s = s.replace(REPL_REGEX, match => REPLACEMENTS[match] || match);
  // 4) remove diacritic marks (combining marks)
  s = s.replace(/[\u0300-\u036f]/g, "");
  // 5) collapse repeated non-word separators to single space
  s = s.replace(/[_\-\u2010-\u2015]+/g, " ");
  // 6) remove non-alphanumeric except spaces
  s = s.replace(/[^\p{L}\p{N} ]/gu, "");
  // 7) lowercase and trim
  s = s.toLowerCase().trim();
  // 8) also collapse repeated spaces
  s = s.replace(/\s+/g, " ");
  return s;
}

// build abuse regex against normalized abuse words (word boundary)
const normalizedAbuse = ABUSE_WORDS.map(w => normalizeText(w)).filter(Boolean);
const abuseRegex = new RegExp("\\b(?:" + normalizedAbuse.map(w=>escapeForRegex(w)).join("|") + ")\\b", "i");

// in-memory warnings store: key -> { count, timeoutId }
const warnings = new Map();

/**
 * check if sender is admin
 */
async function isSenderAdmin(api, threadID, senderID){
  try {
    const threadInfo = await api.getThreadInfo(threadID);
    if(!threadInfo) return false;
    const admins = threadInfo.adminIDs || threadInfo.admins || (threadInfo.adminsInfo && threadInfo.adminsInfo.map(a=>a.id));
    if(!admins) return false;
    return admins.some(a => (typeof a === "object" ? a.id == senderID : a == senderID));
  } catch(e){
    return false;
  }
}

/**
 * attempt removal with robust ordering (some libs: removeUserFromGroup(threadID, userID), others reverse)
 */
async function tryRemove(api, threadID, userID){
  // try common signatures
  try {
    if(typeof api.removeUserFromGroup === "function"){
      // try (threadID, userID)
      try { await api.removeUserFromGroup(threadID, userID)
