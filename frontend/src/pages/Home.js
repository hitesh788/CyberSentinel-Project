import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Dashboard from "../components/Dashboard";
import Footer from "../components/Footer";
import { getLiveIncidents, getIncidents } from "../api/cyberAPI";

function Home({ toggleTheme, dark }) {

const [incidents,setIncidents]=useState([]);
const [liveIncidents,setLiveIncidents]=useState([]);
const [status,setStatus]=useState("normal");
const [loading,setLoading]=useState(true);
const firstLoadRef = useRef(true);

const calculateStatus = useCallback((data) => {
  const score = data.reduce((acc, i) => {
    if (i.severity === "Critical") return acc + 20;
    if (i.severity === "High") return acc + 10;
    if (i.severity === "Medium") return acc + 5;
    return acc + 2;
  }, 0);

  // Score thresholds: green <= 200, moderate 201-280, red > 280
  if (score > 280) return "critical"; // red
  if (score > 200) return "medium"; // yellow
  return "normal"; // green
}, []);

const loadData = useCallback(async () => {
  if (firstLoadRef.current) {
    setLoading(true);
  }

  try {
    const [incidentsRes, liveRes] = await Promise.all([getIncidents(), getLiveIncidents()]);

    setIncidents(incidentsRes.data);
    setLiveIncidents(liveRes.data);

    /* 🔥 Calculate status */
    setStatus(calculateStatus([...(incidentsRes.data || []), ...(liveRes.data || [])]));
  } catch (e) {
    console.log(e);
  }

  if (firstLoadRef.current) {
    setLoading(false);
    firstLoadRef.current = false;
  }
}, [calculateStatus]);

useEffect(() => {
  loadData();

  const interval = setInterval(() => {
    loadData();
  }, 30000);

  return () => clearInterval(interval);
}, [loadData]);

return(

<div>

{/* ✅ Pass theme props */}
<Navbar toggleTheme={toggleTheme} dark={dark} status={status} />

  {loading ? (
    <div className="loader-container">
      <div className="cyber-loader"></div>
      <p>Loading Cyber Incident Feed...</p>
    </div>
  ) : (
    <>
      <Dashboard incidents={incidents} liveIncidents={liveIncidents} />
      <Footer />
    </>
  )}

</div>

)

}

export default Home;