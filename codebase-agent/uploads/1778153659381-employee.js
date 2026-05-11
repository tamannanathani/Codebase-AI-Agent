import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Employee = sequelize.define(
  "Employee",
  {
    employee_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    org_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: "organizations",
        key: "org_id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    branch_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      references: {
        model: "branch",
        key: "branch_id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_type: {
      type: DataTypes.ENUM("Branch Admin","Manager","Employee"),
      allowNull: false,
      defaultValue: "Employee",
    },
    manager_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "employees",
        key: "employee_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    tel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creation_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    modification_datetime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "employees",
    timestamps: false,
  }
);

export default Employee;
