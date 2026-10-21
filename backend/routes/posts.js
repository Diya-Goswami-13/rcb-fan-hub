const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

// Fan wall: latest first
router.get("/", async (req, res) => {
  try {
    res.json(await Post.find().sort({ createdAt: -1 }).limit(50));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { fanName, message } = req.body;
    res.status(201).json(await Post.create({ fanName, message }));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Like a post
router.patch("/:id/like", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
