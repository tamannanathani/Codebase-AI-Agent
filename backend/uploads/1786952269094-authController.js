import Employee from "../models/employee.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const normalizeEmployeeRole = (role) =>
  String(role || "").trim().toLowerCase() === "branch admin" ? "Branch Admin" : "Employee";

export const signup = async (req, res) => {
  try {
    const {
      org_id,
      branch_id,
      name,
      email,
      password,
      user_type,
      manager_id,
      designation,
      tel,
      address,
      picture,
      provider,
      uid,
      status,
    } = req.body;

    if (!org_id || !branch_id || !name || !email || !password) {
      return res.status(400).json({ error: "org_id, branch_id, name, email and password are required" });
    }

    const existing = await Employee.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const employee = await Employee.create({
      org_id,
      branch_id,
      name,
      email,
      password: await bcrypt.hash(password, 10),
      user_type: normalizeEmployeeRole(user_type),
      manager_id: manager_id || null,
      designation: designation || null,
      tel: tel || null,
      address: address || null,
      picture: picture || null,
      provider: provider || null,
      uid: uid || null,
      status: status || "active",
      creation_datetime: new Date(),
      modification_datetime: new Date(),
    });

    const token = jwt.sign(
      {
        employee_id: employee.employee_id,
        org_id: employee.org_id,
        branch_id: employee.branch_id,
        user_type: employee.user_type,
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        user_type: employee.user_type,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ where: { email } });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (String(employee.status || "").toLowerCase() === "inactive") {
      return res.status(403).json({ error: "Employee account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        employee_id: employee.employee_id,
        org_id: employee.org_id,
        branch_id: employee.branch_id,
        user_type: employee.user_type,
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        role: employee.user_type,
        status: employee.status,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
