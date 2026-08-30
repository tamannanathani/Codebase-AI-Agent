import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

const Organization = sequelize.define(
  "Organization",
  {
    org_id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv4(),
    },
    email: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    tel: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    pin: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },
    contact_person: { type: DataTypes.STRING, allowNull: true },
    c_mobile: { type: DataTypes.STRING, allowNull: true },
    c_email: { type: DataTypes.STRING, allowNull: true },
    logo: { type: DataTypes.STRING, allowNull: true },
    org_type: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
    creation_datetime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    modification_datetime: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "organizations",
    timestamps: false,
  }
);

export default Organization;

