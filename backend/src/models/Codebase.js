import mongoose from "mongoose";

const codebaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Codebase = mongoose.model("Codebase", codebaseSchema);

export default Codebase;