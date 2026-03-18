const mongoose = require("mongoose");

let connected = false;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    connected = true;
    console.log("MongoDB Connected");
  } catch (error) {
    connected = false;
    console.warn("MongoDB connection error (running in fallback mode):", error.message);
  }
};

const isDbConnected = () => {
  return connected || mongoose.connection.readyState === 1;
};

module.exports = { connectDB, isDbConnected };