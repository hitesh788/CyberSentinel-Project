// Simple keyword-based "ML" classifier for cyber incident metadata.

const severityKeywords = {
  Critical: ["critical", "zero-day", "ransomware", "data leak", "data breach", "severe"],
  High: ["exploit", "vulnerability", "cve", "malware", "trojan", "botnet", "phish", "phishing", "breach"],
  Medium: ["suspicious", "scan", "scanner", "spam", "scan", "unauthorized"],
  Low: ["info", "notice", "update", "maintenance", "scheduled"],
};

const sectorKeywords = {
  Banking: ["bank", "finance", "payment", "upi", "atm"],
  Telecom: ["telecom", "network", "isp", "mobile"],
  Healthcare: ["health", "hospital", "medical"],
  Education: ["school", "college", "university", "education"],
  Government: ["gov", "government", "ministr", "cert-in", "police", "defence"],
  Energy: ["energy", "power", "grid", "oil", "gas"],
  Manufacturing: ["manufactur", "factory", "industrial"],
  Retail: ["retail", "e-commerce", "shopping"],
};

const attackTypeKeywords = {
  Phishing: ["phish", "credential", "login", "scam", "spoof"],
  Malware: ["malware", "ransomware", "trojan", "virus", "worm", "botnet"],
  "Vulnerability Exploit": ["cve", "exploit", "vulnerability", "zero-day", "patch"],
  "Denial of Service": ["ddos", "denial of service", "traffic spike"],
  "Data Leak": ["data leak", "data breach", "exposed", "leak"],
  Other: ["incident", "security", "advisory", "alert"],
};

const normalize = (text = "") => (text || "").toString().toLowerCase();

function pickByKeyword(text, keywordMap, fallback) {
  const cleaned = normalize(text);
  for (const [label, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((k) => cleaned.includes(k))) {
      return label;
    }
  }
  return fallback;
}

function classifySeverity(text) {
  return pickByKeyword(text, severityKeywords, "Medium");
}

function classifySector(text) {
  return pickByKeyword(text, sectorKeywords, "General");
}

function classifyAttackType(text) {
  return pickByKeyword(text, attackTypeKeywords, "Unknown");
}

function enrichIncident(incident) {
  const title = incident.title || "";
  const source = incident.source || "";
  const combined = `${title} ${source}`;
  const date = incident.date || incident.timestamp || new Date();

  return {
    ...incident,
    date,
    severity: incident.severity || classifySeverity(combined),
    sector: incident.sector || classifySector(combined),
    attackType: incident.attackType || classifyAttackType(combined),
  };
}

module.exports = {
  classifySeverity,
  classifySector,
  classifyAttackType,
  enrichIncident,
};
