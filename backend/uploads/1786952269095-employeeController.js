
import bcrypt from "bcrypt";
import Employee from "../models/employee.js";
import Organization from "../models/organization.js";
import Branch from "../models/branch.js";


const normalizeEmployeeRole = (role) =>
  String(role || "").trim().toLowerCase() === "branch admin" ? "Branch Admin" : "Employee";

const buildEmployeeOrgScope = (req, extraWhere = {}) => {
  const where = { ...extraWhere };

  if (req.user?.org_id) {
    where.org_id = req.user.org_id;
  }

  return where;
};

export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      org_id,
      branch_id,
      user_type,
      manager_id,
      designation,
      tel,
      address,
      picture,
      provider,
      uid,
      status,
      joining_date,
      probation_end_date,
      probation_period_months,
      dob,
      father_name,
      emergency_contact,
      blood_group,
      government_id,
      bank_name,
      bank_account_number,
      ifsc_code,
      pan_number,
    } = req.body;

    if (!name || !email || !password || !org_id || !branch_id) {
      return res.status(400).json({
        success: false,
        error: "name, email, password, org_id and branch_id are required",
      });
    }

    if (req.user?.org_id && String(req.user.org_id) !== String(org_id)) {
      return res.status(403).json({
        success: false,
        error: "You can only create employees within your organization",
      });
    }

    const org = await Organization.findByPk(org_id);
    if (!org) {
      return res.status(404).json({ success: false, error: "Organization not found" });
    }

    const branch = await Branch.findOne({ where: { branch_id, org_id } });
    if (!branch) {
      return res.status(404).json({ success: false, error: "Branch not found in this organization" });
    }

    const existing = await Employee.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: "Email already exists" });
    }

    if (manager_id) {
      const manager = await Employee.findOne({
        where: {
          employee_id: manager_id,
          org_id,
          branch_id,
          status: "active",
        },
      });
      if (!manager) {
        return res.status(400).json({ success: false, error: "manager_id is invalid for this branch" });
      }
    }

    const employee = await Employee.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      org_id,
      branch_id,
      user_type: normalizeEmployeeRole(user_type),
      manager_id: manager_id || null,
      designation: designation || null,
      tel: tel || null,
      address: address || null,
      picture: picture || null,
      provider: provider || null,
      uid: uid || null,
      status: status || "active",
      joining_date: joining_date || null,
      probation_end_date: probation_end_date || null,
      probation_period_months:
        probation_period_months !== undefined && probation_period_months !== null && probation_period_months !== ""
          ? Number(probation_period_months)
          : null,
      dob: dob || null,
      father_name: father_name || null,
      emergency_contact: emergency_contact || null,
      blood_group: blood_group || null,
      government_id: government_id || null,
      bank_name: bank_name || null,
      bank_account_number: bank_account_number || null,
      ifsc_code: ifsc_code || null,
      pan_number: pan_number || null,
      creation_datetime: new Date(),
      modification_datetime: new Date(),
    });

    // Initialize leave balance for the new employee


    const data = employee.toJSON();
    delete data.password;

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { org_id, branch_id, status } = req.query;
    const where = buildEmployeeOrgScope(req, {
      ...(branch_id && { branch_id }),
      ...(status && { status }),
    });

    if (!req.user?.org_id && org_id) {
      where.org_id = org_id;
    }

    const employees = await Employee.findAll({
      where,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Employee,
          as: "manager",
          attributes: ["employee_id", "name", "email", "designation"],
        },
      ],
      order: [["creation_datetime", "DESC"]],
    });

    return res.json({ success: true, data: employees });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({
      where: buildEmployeeOrgScope(req, { employee_id: id }),
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Employee,
          as: "manager",
          attributes: ["employee_id", "name", "email", "designation"],
        },
      ],
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    return res.json({ success: true, data: employee });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({
      where: buildEmployeeOrgScope(req, { employee_id: id }),
    });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    const {
      name,
      email,
      password,
      user_type,
      manager_id,
      designation,
      status,
      joining_date,
      probation_end_date,
      probation_period_months,
      tel,
      address,
      picture,
      provider,
      uid,
      dob,
      father_name,
      emergency_contact,
      blood_group,
      government_id,
      bank_name,
      bank_account_number,
      ifsc_code,
      pan_number,
    } = req.body;

    if (email && email !== employee.email) {
      const exists = await Employee.findOne({ where: { email } });
      if (exists) {
        return res.status(409).json({ success: false, error: "Email already exists" });
      }
    }

    if (manager_id) {
      if (Number(manager_id) === Number(employee.employee_id)) {
        return res.status(400).json({ success: false, error: "Employee cannot be their own manager" });
      }

      const manager = await Employee.findOne({
        where: {
          employee_id: manager_id,
          org_id: employee.org_id,
          branch_id: employee.branch_id,
          status: "active",
        },
      });
      if (!manager) {
        return res.status(400).json({ success: false, error: "manager_id is invalid for this branch" });
      }
    }

    await employee.update({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(password !== undefined && { password: await bcrypt.hash(password, 10) }),
      ...(user_type !== undefined && { user_type: normalizeEmployeeRole(user_type) }),
      ...(manager_id !== undefined && { manager_id }),
      ...(designation !== undefined && { designation }),
      ...(status !== undefined && { status }),
      ...(joining_date !== undefined && { joining_date: joining_date || null }),
      ...(probation_end_date !== undefined && { probation_end_date: probation_end_date || null }),
      ...(probation_period_months !== undefined && {
        probation_period_months:
          probation_period_months !== null && probation_period_months !== ""
            ? Number(probation_period_months)
            : null,
      }),
      ...(tel !== undefined && { tel }),
      ...(address !== undefined && { address }),
      ...(picture !== undefined && { picture }),
      ...(provider !== undefined && { provider }),
      ...(uid !== undefined && { uid }),
      ...(dob !== undefined && { dob: dob || null }),
      ...(father_name !== undefined && { father_name: father_name || null }),
      ...(emergency_contact !== undefined && { emergency_contact: emergency_contact || null }),
      ...(blood_group !== undefined && { blood_group: blood_group || null }),
      ...(government_id !== undefined && { government_id: government_id || null }),
      ...(bank_name !== undefined && { bank_name: bank_name || null }),
      ...(bank_account_number !== undefined && { bank_account_number: bank_account_number || null }),
      ...(ifsc_code !== undefined && { ifsc_code: ifsc_code || null }),
      ...(pan_number !== undefined && { pan_number: pan_number || null }),
      modification_datetime: new Date(),
    });

    const data = employee.toJSON();
    delete data.password;

    return res.json({ success: true, message: "Employee updated", data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findOne({
      where: buildEmployeeOrgScope(req, { employee_id: id }),
    });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found" });
    }

    await employee.update({
      status: "inactive",
      modification_datetime: new Date(),
    });

    return res.json({ success: true, message: "Employee deactivated" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


