const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: ["Batter", "Bowler", "All-rounder", "Wicket-keeper"],
    },
    nationality: { type: String, default: "India", trim: true },
    jerseyNumber: { type: Number, min: 0, max: 999 },
    note: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Player", playerSchema);
