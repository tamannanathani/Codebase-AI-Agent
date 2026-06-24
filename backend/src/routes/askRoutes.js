import express from "express";
import {askCodebase} from "../controllers/askController.js";

const router = express.Router();

router.post("/ask", askCodebase);

export default router;