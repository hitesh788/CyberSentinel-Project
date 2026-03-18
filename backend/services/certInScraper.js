const axios = require("axios");
const cheerio = require("cheerio");
const { enrichIncident } = require("./mlClassifier");

const CERT_IN_HOME = "https://www.cert-in.org.in/s2cMainServlet?pageid=PUBWEL01";

/**
 * Fetch recent CERT-In advisories and convert them into incident objects.
 */
async function fetchCertInAdvisories() {
  try {
    const res = await axios.get(CERT_IN_HOME, { timeout: 15000 });
    const $ = cheerio.load(res.data);

    const incidents = [];

    $("span.BContent a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();

      // We only care about the official CERT-In advisory list
      if (!href.includes("PUBVLNOTES02")) return;

      const parent = $(el).closest("td");
      const dateText = parent.find("span.DateContent").first().text().trim();
      const dateMatch = dateText.match(/\(([^)]+)\)/);
      const dateParsed = dateMatch ? new Date(dateMatch[1]) : new Date();

      const incident = {
        title: text,
        source: "CERT-In",
        location: "India",
        date: isNaN(dateParsed.getTime()) ? new Date() : dateParsed,
        indicator: `https://www.cert-in.org.in/${href.replace(/^\./, "")}`,
        description: "Official CERT-In advisory",
      };

      incidents.push(enrichIncident(incident));
    });

    return incidents;
  } catch (err) {
    console.error("CERT-In scraping error:", err.message);
    return [];
  }
}

module.exports = { fetchCertInAdvisories };
