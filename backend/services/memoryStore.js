// In-memory fallback store for incidents when MongoDB is unavailable.

const incidents = [];

function addIncident(incident) {
  const record = {
    ...incident,
    date: incident.date ? new Date(incident.date) : new Date(),
    _id: incident._id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  };
  incidents.unshift(record);
  return record;
}

function addIncidents(list) {
  return list.map(addIncident);
}

function getIncidents() {
  return [...incidents];
}

module.exports = { addIncident, addIncidents, getIncidents };
