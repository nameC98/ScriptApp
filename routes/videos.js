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

    const videos = await Video.find(query);

    // Calculation of trending score based on views and subscribers only
    const scoredVideos = videos.map((video) => {
      const daysSinceUpload =
        (Date.now() - new Date(video.uploadDate)) / (1000 * 3600 * 24);
      const normViews = Math.log(video.views + 1);
      const normSubscribers = Math.log(video.channelSubscribers + 1);

      // Adjust these weights as needed
      const viewsWeight = 0.5;
      const subscribersWeight = 0.5;
      const weightedSum =
        viewsWeight * normViews + subscribersWeight * normSubscribers;

      // Apply recency factor with a decay constant (e.g., 30 days)
      const decayConstant = 30;
      const recencyFactor = Math.exp(-daysSinceUpload / decayConstant);

      const trendingScore = weightedSum * recencyFactor;

      return {
        ...video.toObject(),
        trendingScore,
      };
    });

    // Filter videos based on rank if requested
    let filteredVideos = scoredVideos;
    if (rank && rank !== "All") {
      if (rank === "Excellent") {
        filteredVideos = filteredVideos.filter(
          (video) => video.trendingScore >= 7
        );
      } else if (rank === "Very Good") {
        filteredVideos = filteredVideos.filter(
          (video) => video.trendingScore >= 4 && video.trendingScore < 7
        );
      } else if (rank === "Good") {
        filteredVideos = filteredVideos.filter(
          (video) => video.trendingScore < 4
        );
      }
    }

    // Sort results based on the "sort" param
    if (sort === "new") {
      filteredVideos.sort(
        (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
      );
    } else {
      filteredVideos.sort((a, b) => b.trendingScore - a.trendingScore);
    }

    res.json(filteredVideos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// POST /api/videos - For manual data entry (admin-only in a real app)
router.post("/", async (req, res) => {
  const { title, views, likes, uploadDate, channelSubscribers, niche } =
    req.body;
  const video = new Video({
    title,
    views,
    likes,
    uploadDate,
    channelSubscribers,
    niche,
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
