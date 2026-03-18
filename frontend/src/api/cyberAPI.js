import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:5000/api"
})

export const getLiveIncidents = () => API.get("/incidents/live")
export const getIncidents = () => API.get("/incidents")
export const refreshIncidents = () => API.post("/incidents/refresh")
