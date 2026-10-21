const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    fanName: { type: String, required: true, trim: true, maxlength: 40 },
    message: { type: String, required: true, trim: true, maxlength: 280 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
