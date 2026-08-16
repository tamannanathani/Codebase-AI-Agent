import Attendance from "../models/attendance.js";
import Employee from "../models/employee.js";
import { Op } from "sequelize";
import {
	buildWorkScheduleContext,
	getNonWorkingDayInfo,
} from "../services/workScheduleService.js";

function normalizeRole(role) {
	return String(role || "").trim().toLowerCase();
}

function getLocalISODate(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function isAdminRole(role) {
	return role === "admin" || role === "super admin";
}

function isBranchAdminRole(role) {
	return role === "branch admin" || role === "branch_admin" || role === "branch amdin";
}

function isManagerRole(role) {
	return role === "manager";
}

function canMarkAnyEmployeeForAnyDate(role) {
	return isAdminRole(role) || isBranchAdminRole(role);
}

function getAttendancePermissionError({ role, markerId, targetEmployee, targetDate }) {
	const today = getLocalISODate();
	const normalizedDate = String(targetDate || "").slice(0, 10);
	const isSelf = String(targetEmployee?.employee_id) === String(markerId);

	if (canMarkAnyEmployeeForAnyDate(role)) {
		return null;
	}

	if (isManagerRole(role)) {
		if (isSelf) {
			return normalizedDate === today
				? null
				: "Managers can mark their own attendance only for the current date";
		}

		return String(targetEmployee?.manager_id) === String(markerId)
			? null
			: "Managers can mark attendance only for their direct reports";
	}

	if (!isSelf) {
		return "Not authorized to mark attendance for this employee";
	}

	return normalizedDate === today
		? null
		: "You can mark your own attendance only for the current date";
}

export const createAttendance = async (req, res) => {
	try {
		const {
			emp_id,
			employee_id,
			date,
			check_in_time,
			check_out_time,
			source,
		} = req.body;
		const org_id = req.user?.org_id;
		const branch_id = req.user?.branch_id;
		const markerId = req.user?.employee_id;
		let targetEmployeeId = employee_id || emp_id;
		const role = normalizeRole(req.user?.user_type);
		if (!canMarkAnyEmployeeForAnyDate(role) && !isManagerRole(role)) {
			targetEmployeeId = req.user?.employee_id;
		}

		if (!targetEmployeeId || !org_id || !branch_id || !date) {
			return res.status(400).json({
				success: false,
				error: "employee_id and date are required",
			});
		}

		const employee = await Employee.findOne({
			where: { employee_id: targetEmployeeId, org_id },
		});

		if (!employee) {
			return res.status(404).json({
				success: false,
				error: "Employee not found for this organization/branch",
			});
		}

		if (!employee || employee.branch_id !== branch_id) {
			return res.status(404).json({
				success: false,
				error: "Employee not found for this organization/branch",
			});
		}

		const permissionError = getAttendancePermissionError({
			role,
			markerId,
			targetEmployee: employee,
			targetDate: date,
		});
		if (permissionError) {
			return res.status(403).json({
				success: false,
				error: permissionError,
			});
		}

		const workScheduleContext = await buildWorkScheduleContext({
			startDate: date,
			endDate: date,
			employeeIds: [targetEmployeeId],
		});
		const nonWorkingInfo = getNonWorkingDayInfo({
			date,
			employeeId: targetEmployeeId,
			holidayDateSet: workScheduleContext.holidayDateSet,
			employeeWeekOffMap: workScheduleContext.employeeWeekOffMap,
		});

		if (nonWorkingInfo.isNonWorkingDay && !check_in_time) {
			return res.status(400).json({
				success: false,
				error: `Cannot mark absent on a ${nonWorkingInfo.nonWorkingType}.`,
			});
		}

		const existingAttendance = await Attendance.findOne({
			where: {
				employee_id: targetEmployeeId,
				org_id,
				branch_id,
				date,
			},
		});

		if (existingAttendance) {
			return res.status(400).json({
				success: false,
				error: "Only one attendance record per employee is allowed for a day",
			});
		}

		const normalizedSource = (source || "manual").toLowerCase();
		const computedStatus = check_in_time ? "present" : "absent";

		if (normalizedSource === "manual" && check_in_time) {
			const existingCheckIn = await Attendance.findOne({
				where: {
					employee_id: targetEmployeeId,
					org_id,
					branch_id,
					date,
					check_in_time: { [Op.ne]: null },
				},
				order: [["attendance_id", "ASC"]],
			});

			if (existingCheckIn) {
				return res.status(400).json({
					success: false,
					error: "Only first check-in is allowed manually",
				});
			}
		}

		const attendance = await Attendance.create({
			employee_id: targetEmployeeId,
			org_id,
			branch_id,
			date,
			check_in_time: check_in_time || null,
			check_out_time: check_out_time || null,
			status: computedStatus,
			source: normalizedSource,
			marked_by: markerId,
			updated_at: new Date(),
		});

		return res.status(201).json({
			success: true,
			message: "Attendance created successfully",
			data: attendance,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: "Server error",
			details: error.message,
		});
	}
};

export const getAttendances = async (req, res) => {
	try {
		const { emp_id, employee_id, date, status } = req.query;
		const org_id = req.user?.org_id;
		const branch_id = req.user?.branch_id;
		const markerId = req.user?.employee_id;
		const role = normalizeRole(req.user?.user_type);

		const whereClause = {
			...((employee_id || emp_id) && { employee_id: employee_id || emp_id }),
			...(org_id && { org_id }),
			...(branch_id && { branch_id }),
			...(date && { date }),
			...(status && { status }),
		};

		if (!canMarkAnyEmployeeForAnyDate(role)) {
			whereClause.employee_id = markerId;
		}

		const attendances = await Attendance.findAll({
			where: whereClause,
			include: [
				{
					model: Employee,
					as: "employee",
					...(org_id ? { where: { org_id }, required: true } : {}),
					attributes: ["employee_id", "designation", "status"],
				},
			],
			order: [
				["date", "DESC"],
				["attendance_id", "DESC"],
			],
		});

		const employeeIds = Array.from(
			new Set(attendances.map((attendance) => attendance.employee_id).filter(Boolean))
		);
		const attendanceDates = attendances
			.map((attendance) => String(attendance.date || "").slice(0, 10))
			.filter(Boolean);
		const startDate = attendanceDates.length ? attendanceDates.reduce((min, current) => (current < min ? current : min)) : date;
		const endDate = attendanceDates.length ? attendanceDates.reduce((max, current) => (current > max ? current : max)) : date;
		const workScheduleContext =
			startDate && endDate
				? await buildWorkScheduleContext({
						startDate,
						endDate,
						employeeIds,
				  })
				: { holidayDateSet: new Set(), employeeWeekOffMap: new Map() };

		const enrichedAttendances = attendances.map((attendance) => {
			const nonWorkingInfo = getNonWorkingDayInfo({
				date: attendance.date,
				employeeId: attendance.employee_id,
				holidayDateSet: workScheduleContext.holidayDateSet,
				employeeWeekOffMap: workScheduleContext.employeeWeekOffMap,
			});
			const normalizedStatus = String(attendance.status || "").toLowerCase();
			const displayStatus =
				normalizedStatus === "absent" && nonWorkingInfo.isNonWorkingDay
					? nonWorkingInfo.nonWorkingType
					: attendance.status;

			return {
				...attendance.toJSON(),
				is_non_working_day: nonWorkingInfo.isNonWorkingDay,
				non_working_type: nonWorkingInfo.nonWorkingType,
				display_status: displayStatus,
			};
		});

		return res.status(200).json({
			success: true,
			count: enrichedAttendances.length,
			data: enrichedAttendances,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: "Server error",
			details: error.message,
		});
	}
};

export const getAttendanceById = async (req, res) => {
	try {
		const { id } = req.params;
		const org_id = req.user?.org_id;

		const attendance = await Attendance.findOne({
			where: {
				attendance_id: id,
				...(org_id && { org_id }),
			},
			include: [
				{
					model: Employee,
					as: "employee",
					...(org_id ? { where: { org_id }, required: true } : {}),
					attributes: ["employee_id", "designation", "status"],
				},
			],
		});

		if (!attendance) {
			return res.status(404).json({
				success: false,
				error: "Attendance not found",
			});
		}

		const workScheduleContext = await buildWorkScheduleContext({
			startDate: attendance.date,
			endDate: attendance.date,
			employeeIds: [attendance.employee_id],
		});
		const nonWorkingInfo = getNonWorkingDayInfo({
			date: attendance.date,
			employeeId: attendance.employee_id,
			holidayDateSet: workScheduleContext.holidayDateSet,
			employeeWeekOffMap: workScheduleContext.employeeWeekOffMap,
		});
		const normalizedStatus = String(attendance.status || "").toLowerCase();

		return res.status(200).json({
			success: true,
			data: {
				...attendance.toJSON(),
				is_non_working_day: nonWorkingInfo.isNonWorkingDay,
				non_working_type: nonWorkingInfo.nonWorkingType,
				display_status:
					normalizedStatus === "absent" && nonWorkingInfo.isNonWorkingDay
						? nonWorkingInfo.nonWorkingType
						: attendance.status,
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: "Server error",
			details: error.message,
		});
	}
};

export const updateAttendance = async (req, res) => {
	try {
		const { id } = req.params;
		const org_id = req.user?.org_id;

		const attendance = await Attendance.findOne({
			where: {
				attendance_id: id,
				...(org_id && { org_id }),
			},
		});
		if (!attendance) {
			return res.status(404).json({
				success: false,
				error: "Attendance not found",
			});
		}

		const { date, check_in_time, check_out_time, source } = req.body;
		const markerId = req.user?.employee_id;
		const role = normalizeRole(req.user?.user_type);
		const employee = await Employee.findOne({
			where: { employee_id: attendance.employee_id, org_id },
		});
		if (!employee) {
			return res.status(404).json({
				success: false,
				error: "Employee not found for this organization",
			});
		}
		const permissionError = getAttendancePermissionError({
			role,
			markerId,
			targetEmployee: employee,
			targetDate: date !== undefined ? date : attendance.date,
		});
		if (permissionError) {
			return res.status(403).json({
				success: false,
				error: permissionError,
			});
		}

		const nextDate = date !== undefined ? date : attendance.date;
		const nextCheckIn = check_in_time !== undefined ? check_in_time : attendance.check_in_time;
		const workScheduleContext = await buildWorkScheduleContext({
			startDate: nextDate,
			endDate: nextDate,
			employeeIds: [attendance.employee_id],
		});
		const nonWorkingInfo = getNonWorkingDayInfo({
			date: nextDate,
			employeeId: attendance.employee_id,
			holidayDateSet: workScheduleContext.holidayDateSet,
			employeeWeekOffMap: workScheduleContext.employeeWeekOffMap,
		});
		if (nonWorkingInfo.isNonWorkingDay && !nextCheckIn) {
			return res.status(400).json({
				success: false,
				error: `Cannot mark absent on a ${nonWorkingInfo.nonWorkingType}.`,
			});
		}
		const computedStatus = nextCheckIn ? "present" : "absent";

		await attendance.update({
			...(date !== undefined && { date }),
			...(check_in_time !== undefined && { check_in_time }),
			...(check_out_time !== undefined && { check_out_time }),
			...(source !== undefined && { source }),
			marked_by: markerId,
			status: computedStatus,
			updated_at: new Date(),
		});

		return res.status(200).json({
			success: true,
			message: "Attendance updated successfully",
			data: attendance,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: "Server error",
			details: error.message,
		});
	}
};

export const deleteAttendance = async (req, res) => {
	try {
		const { id } = req.params;
		const org_id = req.user?.org_id;

		const attendance = await Attendance.findOne({
			where: {
				attendance_id: id,
				...(org_id && { org_id }),
			},
		});
		if (!attendance) {
			return res.status(404).json({
				success: false,
				error: "Attendance not found",
			});
		}

		await attendance.destroy();

		return res.status(200).json({
			success: true,
			message: "Attendance deleted successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			error: "Server error",
			details: error.message,
		});
	}
};
