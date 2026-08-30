import mongoose from "mongoose";
import Codebase from "./Codebase.js";

const fileSchema = new mongoose.Schema(
  {
    codebaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Codebase",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    path: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      default: "unknown",
    },

    content: {
      type: String,
      default: "",
    },

    imports: {
      type: [String],
      default: [],
    },

    exports: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);

export default File;