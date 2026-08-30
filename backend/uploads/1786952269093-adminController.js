import Admin from "../models/admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";  // ✅ ADD THIS IMPORT

export const adminSignup = async (req, res) => {
  const { 
    email, 
    password, 
    name, 
    mobile, 
    security_q1, 
    security_a1, 
    security_q2,
    security_a2,
    security_q3,
    security_a3,
    securitykey,
    picture, 
    type, 
    admingroup, 
    status 
  } = req.body || {};

  // Required fields validation
  if (!email || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      error: "Email, password and name are required fields" 
    });
  }

  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({ 
        success: false, 
        error: "Admin with this email already exists" 
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin with hashed password
    const newAdmin = await Admin.create({
      email,
      password: hashedPassword, // Store hashed password
      name,
      mobile: mobile || null,
      security_q1: security_q1 || null,
      security_a1: security_a1 || null,
      security_q2: security_q2 || null,
      security_a2: security_a2 || null,
      security_q3: security_q3 || null,
      security_a3: security_a3 || null,
      securitykey: securitykey || null,
      picture: picture || null,
      type: type || null,
      admingroup: admingroup || null,
      status: status || "active",
      creation_datetime: new Date(),
      modification_datetime: new Date()
    });

    // Return response without sensitive data
    res.status(201).json({ 
      success: true, 
      message: "Admin registered successfully", 
      admin: {
        id: newAdmin.super_u_id,
        email: newAdmin.email,
        name: newAdmin.name,
        type: newAdmin.type,
        status: newAdmin.status
      }
    });

  } catch (error) {
    console.error("❌ Admin signup error:", error);
    
    // Handle unique constraint violation
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        success: false, 
        error: "Email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Server error", 
      details: error.message 
    });
  }
};

export const adminlogin = async (req, res) => {
  const { email, password } = req.body || {};

  console.log("🔹 Admin login attempt:", { email, hasPassword: !!password });
  console.log("🔹 JWT_SECRET exists:", !!process.env.JWT_SECRET);

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: "Email and password are required" 
    });
  }

  try {
    // Find admin using Sequelize
    const admin = await Admin.findOne({
      where: { email },
    });

    if (!admin) {
      console.log("❌ Admin not found:", email);
      return res.status(401).json({  // ✅ Use 401 instead of 404 for security
        success: false, 
        error: "Invalid credentials" 
      });
    }

    console.log("✅ Admin found:", admin.email);

    // ✅ FIXED: Compare with hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    console.log("✅ Password correct");

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        error: "Account is inactive. Please contact administrator." 
      });
    }

    // Generate JWT token with role "admin"
    const token = jwt.sign(
      { 
        id: admin.super_u_id, 
        email: admin.email,
        role: "admin"
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1d" }
    );

    console.log("✅ JWT Token generated successfully");

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin.super_u_id,
        name: admin.name,
        email: admin.email,
        role: "admin"
      },
      token,
    });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error", 
      details: err.message 
    });
  }
};

