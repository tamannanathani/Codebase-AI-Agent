// src/server.js
// Server setup and configuration
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectMongoDB } from "./config/mongodb.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();