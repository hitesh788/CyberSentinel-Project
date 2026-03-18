const axios = require("axios")
const { enrichIncident } = require("./mlClassifier")
const { fetchCertInAdvisories } = require("./certInScraper")

/* ===================== */
/* RANDOM SEVERITY       */
/* ===================== */

function getRandomSeverity(){
  const levels = ["Low","Medium","High","Critical"]
  return levels[Math.floor(Math.random()*levels.length)]
}


/* ===================== */
/* OPENPHISH             */
/* ===================== */

async function fetchOpenPhish(){

try{

const res = await axios.get("https://openphish.com/feed.txt")

const urls = res.data.split("\n").filter(Boolean)
.slice(0, Math.floor(Math.random()*15)+5)

return urls.map(url => ({

title:"Phishing site detected",
severity:getRandomSeverity(),
attackType:"Phishing",
sector:"Web",
source:"OpenPhish",
indicator:url,
timestamp: Date.now()

}))

}catch(err){

console.log("OpenPhish error:", err.message)
return []

}

}


/* ===================== */
/* CISA                  */
/* ===================== */

async function fetchCISA(){

try{

const res = await axios.get(
"https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
)

const vulns = res.data.vulnerabilities
.slice(0, Math.floor(Math.random()*10)+5)

return vulns.map(v => ({

title:`Exploit detected: ${v.cveID}`,
severity:getRandomSeverity(),
attackType:"Vulnerability Exploit",
sector:"Infrastructure",
source:"CISA",
indicator:v.product,
timestamp: Date.now()

}))

}catch(err){

console.log("CISA error:", err.message)
return []

}

}


/* ===================== */
/* URLHAUS               */
/* ===================== */

async function fetchURLHaus(){

try{

const res = await axios.get(
"https://urlhaus.abuse.ch/downloads/json_recent/"
)

const urls = res.data.urls || []

const data = urls.slice(
0,
Math.floor(Math.random()*15)+5
)

return data.map(u => ({

title:"Malware distribution detected",
severity:getRandomSeverity(),
attackType:"Malware",
sector:"Web",
source:"URLHaus",
indicator:u.url,
timestamp: Date.now()

}))

}catch(err){

console.log("URLHaus error:", err.message)
return []

}

}


/* ===================== */
/* MAIN AGGREGATOR       */
/* ===================== */

async function fetchThreatIntel(){
  console.log("🔥 Fetching NEW data at", new Date())

  const phishing = (await fetchOpenPhish()).map(enrichIncident)
  const vulnerabilities = (await fetchCISA()).map(enrichIncident)
  const malware = (await fetchURLHaus()).map(enrichIncident)
  const certIn = (await fetchCertInAdvisories()).map(enrichIncident)

  /* ===================== */
  /* ADD DYNAMIC VARIATION */
  /* ===================== */

  const simulated = Array.from(
    { length: Math.floor(Math.random()*5) },
    (_, i) =>
      enrichIncident({
        title: "Simulated live threat",
        source: "System",
        indicator: "dynamic",
        timestamp: Date.now(),
      })
  )

  const threats = [
    ...certIn,
    ...phishing,
    ...vulnerabilities,
    ...malware,
    ...simulated, // 🔥 ensures variation
  ]

  return threats
}

module.exports = { fetchThreatIntel }