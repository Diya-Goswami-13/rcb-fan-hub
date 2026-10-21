require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Player = require("./models/Player");
const seedPlayers = require("./seed");

const app = express();

// CORS: allow only the deployed frontend(s). Empty CLIENT_URL = allow all (local only)
const allowed = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);
app.use(cors({ origin: allowed.length ? allowed : true }));
app.use(express.json());

app.get("/", (req, res) =>
  res.json({ status: "ok", app: "RCB Fan Hub API", message: "Ee Sala Cup Namde!" })
);
app.use("/api/players", require("./routes/players"));
app.use("/api/posts", require("./routes/posts"));

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Add it in .env (local) or in Render > Environment.");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Atlas connected");
    if ((await Player.countDocuments()) === 0) {
      await Player.insertMany(seedPlayers);
      console.log("Seeded starter squad");
    }
    app.listen(PORT, "0.0.0.0", () => console.log(`API running on port ${PORT}`));
  } catch (err) {
    console.error("Startup failed:", err.message);
    process.exit(1);
  }
}
start();
