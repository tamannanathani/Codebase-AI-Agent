// src/app.js
// Entry point for the application
import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import askRoutes from "./routes/askRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", uploadRoutes);
app.use("/api", askRoutes);

app.get("/", (req, res) => {
  res.send("Codebase Agent API Running");
});

export default app;