const express = require("express");
const router = express.Router();
const {
  getIncidents,
  getLiveIncidents,
  refreshIncidents,
  addIncident,
} = require("../controllers/incidentController");

router.get("/", getIncidents);
router.get("/live", getLiveIncidents);
router.post("/refresh", refreshIncidents);
router.post("/", addIncident);

module.exports = router;