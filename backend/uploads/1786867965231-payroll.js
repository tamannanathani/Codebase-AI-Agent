import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Employee from "./employee.js";

const Payroll = sequelize.define(
    "Payroll",
    {
        payroll_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "employees",
                key: "employee_id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },

        month: {
            type: DataTypes.INTEGER, // 1–12
            allowNull: false,
        },

        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        working_days: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        present_days: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },

        unpaid_leave_days: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },

        paid_leave_days: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },

        base_salary: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        per_day_salary: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        attendance_deduction: {
  type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0,
},

total_deductions: {
  type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0,
},

        final_salary: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        status: {
            type: DataTypes.ENUM("generated", "paid"),
            defaultValue: "generated",
        },
    },
    {
        tableName: "payrolls",
        timestamps: true,

        indexes: [
            {
                unique: true,
                fields: ["employee_id", "month", "year"],
            },
        ],
    }
);

export default Payroll;