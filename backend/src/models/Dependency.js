import mongoose from "mongoose";
import Codebase from "./Codebase.js";

const dependencySchema = new mongoose.Schema(
  {
    codebaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Codebase",
      required: true,
      index: true,
    },

    sourceFile: {
      type: String,
      required: true,
    },

    targetFile: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      default: "import",
    },
  },
  {
    timestamps: true,
  }
);

const Dependency = mongoose.model(
  "Dependency",
  dependencySchema
);

export default Dependency;