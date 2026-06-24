import express from "express";
import {
	createAttendance,
	getAttendances,
	getAttendanceById,
	updateAttendance,
	deleteAttendance,
} from "../controller/attendanceController.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateUser);

router.post("/", createAttendance);
router.get("/", getAttendances);
router.get("/:id", getAttendanceById);
router.put("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

export default router;
