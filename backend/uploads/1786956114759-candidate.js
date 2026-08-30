import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Candidate = sequelize.define(
  "Candidate",
  {
    candidate_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "jobs",
        key: "job_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resume_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cover_letter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    pipeline_stage: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Applied",
    },

    applied_at: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "candidates",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
        name: "candidates_email_unique",
      },
    ],
    // Note: phone has allowNull: true, so to avoid DB-level unique constraint issue
    // (multiple NULLs or varying DB collation behaviors), phone uniqueness is handled
    // strictly at the controller level instead of a database-level unique index.
  }
);

export default Candidate;
