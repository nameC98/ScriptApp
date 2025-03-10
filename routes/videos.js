import express from "express";
import Video from "../models/Video.js";

const router = express.Router();

router.get("/niches", async (req, res) => {
  try {
    const niches = await Video.distinct("niche");
    res.json(niches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/videos?niche=<niche>&minViews=&maxViews=&minLikes=&maxLikes=&sort=new|rank&rank=Excellent|Very Good|Good
router.get("/", async (req, res) => {
  try {
    const { niche, sort, rank } = req.query;
    let query = {};

    if (niche && niche !== "all") {
      query.niche = niche;
    }
    // Filter by rank if provided
    if (rank && rank !== "All") {
      query.rank = rank;
    }

    const videos = await Video.find(query);

    // Sort results based on the "sort" parameter
    let sortedVideos;
    if (sort === "new") {
      sortedVideos = videos.sort(
        (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
      );
    } else if (sort === "rank") {
      sortedVideos = videos.sort(
        (a, b) => (b.trendingScore || 0) - (a.trendingScore || 0)
      );
    } else {
      sortedVideos = videos;
    }

    res.json(sortedVideos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// POST /api/videos - For manual data entry (admin-only in a real app)
router.post("/", async (req, res) => {
  const {
    title,
    views,
    likes,
    uploadDate,
    channelSubscribers,
    niche,
    trendingScore,
    rank,
  } = req.body;
  const video = new Video({
    title,
    views,
    likes,
    uploadDate,
    channelSubscribers,
    niche,
    trendingScore,
    rank,
  });
  try {
    const newVideo = await video.save();
    res.status(201).json(newVideo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/videos/:id - Delete a video by its ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVideo = await Video.findByIdAndDelete(id);
    if (!deletedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/videos/:id - Edit the title of a video by its ID
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );
    if (!updatedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.json(updatedVideo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
