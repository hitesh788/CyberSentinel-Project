const Incident = require("../models/Incident");
const { fetchThreatIntel } = require("../services/threatIntel");
const { isDbConnected } = require("../config/db");
const memoryStore = require("../services/memoryStore");

const seedIncidents = async () => {
  if (!isDbConnected()) {
    if (memoryStore.getIncidents().length === 0) {
      memoryStore.addIncidents([
        {
          title: "Credential stuffing attempt on banking login",
          source: "Seed Data",
          severity: "High",
          sector: "Banking",
          attackType: "Credential Attack",
          description: "Multiple failed login attempts detected from suspicious IP ranges.",
          location: "India",
        },
        {
          title: "Malware attachment delivered via spoofed email",
          source: "Seed Data",
          severity: "Medium",
          sector: "Education",
          attackType: "Malware",
          description: "Spoofed institutional email delivered malicious attachments.",
          location: "India",
        },
      ]);
    }
    return;
  }

  const count = await Incident.countDocuments();
  if (count === 0) {
    await Incident.insertMany([
      {
        title: "Credential stuffing attempt on banking login",
        source: "Seed Data",
        severity: "High",
        sector: "Banking",
        attackType: "Credential Attack",
        description: "Multiple failed login attempts detected from suspicious IP ranges.",
        location: "India",
      },
      {
        title: "Malware attachment delivered via spoofed email",
        source: "Seed Data",
        severity: "Medium",
        sector: "Education",
        attackType: "Malware",
        description: "Spoofed institutional email delivered malicious attachments.",
        location: "India",
      },
    ]);
  }
};

const getIncidents = async (req, res) => {
  try {
    await seedIncidents();
    const incidents = isDbConnected()
      ? await Incident.find().sort({ date: -1 })
      : memoryStore.getIncidents();
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshIncidents = async (req, res) => {
  try {
    const incidents = await fetchThreatIntel();

    if (isDbConnected()) {
      await Incident.insertMany(incidents, { ordered: false });
    } else {
      memoryStore.addIncidents(incidents);
    }

    res.json({ message: "Incidents refreshed", count: incidents.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to refresh incidents" });
  }
};

const getLiveIncidents = async (req, res) => {
  try {
    const data = await fetchThreatIntel();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch live incidents" });
  }
};

const addIncident = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const record = memoryStore.addIncident(req.body);
      return res.status(201).json(record);
    }

    const incident = await Incident.create(req.body);
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getIncidents,
  getLiveIncidents,
  refreshIncidents,
  addIncident,
};