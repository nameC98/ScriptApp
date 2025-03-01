import express from "express";
import User from "../models/User.js";
import Script from "../models/Script.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import Prompt from "../models/Prompt.js";
import axios from "axios";

dotenv.config();

const router = express.Router();

// Use your GitHub token for the ChatGPT-4 API
const token = process.env.REACT_APP_GITHUB_TOKEN;
const endpoint = "https://models.inference.ai.azure.com"; // Update if necessary
const modelName = "gpt-4o";

// Initialize the OpenAI client with the endpoint and API key
const client = new OpenAI({
  baseURL: endpoint,
  apiKey: token,
});

// GET: Fetch all scripts (for testing purposes)
router.get("/", async (req, res) => {
  try {
    const scripts = await Script.find();
    res.json(scripts); // Each script now contains createdAt and updatedAt
  } catch (error) {
    console.error("Error fetching scripts:", error);
    res.status(500).json({ error: "Error fetching scripts" });
  }
});

// GET: Fetch scripts for a specific user, with optional date filtering
router.get("/my-scripts/:userId", async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;
  let filter = { userId };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  try {
    const scripts = await Script.find(filter);
    if (!scripts.length) {
      return res.status(404).json({ error: "No scripts found for this user" });
    }
    res.json(scripts);
  } catch (error) {
    console.error("Error fetching user scripts:", error);
    res.status(500).json({ error: "Error fetching user scripts" });
  }
});

router.get("/prompts", async (req, res) => {
  try {
    // Your logic to fetch prompts (admin and/or user prompts)
    const prompts = await Prompt.find();
    res.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ error: "Error fetching prompts" });
  }
});

// GET: Fetch all public admin scripts
router.get("/public", async (req, res) => {
  try {
    // Only return scripts that were posted by the admin
    const scripts = await Script.find({ isAdmin: true });
    res.json(scripts);
  } catch (error) {
    console.error("Error fetching admin scripts:", error);
    res.status(500).json({ error: "Error fetching admin scripts" });
  }
});

// PATCH: Edit an existing prompt template (admin update)
router.patch("/prompt/:id", async (req, res) => {
  const { id } = req.params;
  const { niche, style, promptTemplate } = req.body;
  if (!niche || !style || !promptTemplate) {
    return res.status(400).json({
      error: "Missing required fields: niche, style, and promptTemplate",
    });
  }
  try {
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      { niche, style, promptTemplate },
      { new: true }
    );
    if (!updatedPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    res.json({ message: "Prompt updated successfully", prompt: updatedPrompt });
  } catch (error) {
    console.error("Error updating prompt:", error);
    res.status(500).json({ error: "Error updating prompt" });
  }
});

// DELETE: Delete a prompt template (admin delete)
router.delete("/prompt/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPrompt = await Prompt.findByIdAndDelete(id);
    if (!deletedPrompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    res.json({ message: "Prompt deleted successfully", prompt: deletedPrompt });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    res.status(500).json({ error: "Error deleting prompt" });
  }
});

// POST: Create a new user prompt template
router.post("/prompts", async (req, res) => {
  const { niche, style, promptTemplate, userId } = req.body;
  if (!niche || !style || !promptTemplate || !userId) {
    return res.status(400).json({
      error:
        "Missing required fields: niche, style, promptTemplate, and userId",
    });
  }
  try {
    const newPrompt = new Prompt({
      niche,
      style,
      promptTemplate,
      created_by: userId,
      is_admin: false, // User-created prompt
    });
    await newPrompt.save();
    res.json({
      message: "Prompt template saved successfully",
      prompt: newPrompt,
    });
  } catch (error) {
    console.error("Error saving prompt template:", error);
    res.status(500).json({ error: "Error saving prompt template" });
  }
});

// PATCH: Edit a user prompt template (only if owned by the user)
router.patch("/prompts/:id", async (req, res) => {
  const { id } = req.params;
  const { niche, style, promptTemplate, userId } = req.body;
  if (!niche || !style || !promptTemplate || !userId) {
    return res.status(400).json({
      error:
        "Missing required fields: niche, style, promptTemplate, and userId",
    });
  }
  try {
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    // Only allow edit if the prompt is user-created and owned by the user
    if (prompt.is_admin || prompt.created_by.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this prompt" });
    }
    prompt.niche = niche;
    prompt.style = style;
    prompt.promptTemplate = promptTemplate;
    await prompt.save();
    res.json({ message: "Prompt updated successfully", prompt });
  } catch (error) {
    console.error("Error updating prompt:", error);
    res.status(500).json({ error: "Error updating prompt" });
  }
});

// DELETE: Delete a user prompt template (only if owned by the user)
router.delete("/prompts/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }
  try {
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    if (prompt.is_admin || prompt.created_by.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this prompt" });
    }
    await Prompt.findByIdAndDelete(id);
    res.json({ message: "Prompt deleted successfully" });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    res.status(500).json({ error: "Error deleting prompt" });
  }
});

// POST: Toggle bookmark for a prompt
// POST: Toggle bookmark for a prompt
router.post("/prompts/:id/bookmark", async (req, res) => {
  const { id } = req.params; // Prompt ID
  const { userId } = req.body; // Logged-in user's ID

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize bookmarks if needed
    if (!user.bookmarks) {
      user.bookmarks = [];
    }

    // Toggle bookmark in user's bookmarks array:
    const isBookmarked = user.bookmarks.includes(id);
    if (isBookmarked) {
      // Remove bookmark if it exists
      user.bookmarks = user.bookmarks.filter((bookmarkId) => bookmarkId !== id);
    } else {
      // Add bookmark if it doesn't exist
      user.bookmarks.push(id);
    }
    await user.save();

    // Update prompt's favoriteUsers array
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }

    if (!prompt.favoriteUsers) {
      prompt.favoriteUsers = [];
    }

    const userFavorited = prompt.favoriteUsers.includes(userId);
    if (userFavorited) {
      prompt.favoriteUsers = prompt.favoriteUsers.filter(
        (favId) => favId !== userId
      );
    } else {
      prompt.favoriteUsers.push(userId);
    }
    await prompt.save();

    res.json({
      message: isBookmarked
        ? "Bookmark removed successfully"
        : "Prompt bookmarked successfully",
      bookmarks: user.bookmarks,
      prompt,
    });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ error: "Error toggling bookmark" });
  }
});

router.post("/prompts/from-youtube", async (req, res) => {
  const { userId, youtubeUrl, niche, style } = req.body;
  console.log("Request Body:", req.body);

  if (!userId || !youtubeUrl) {
    return res
      .status(400)
      .json({ error: "Missing required fields: userId and YouTube URL" });
  }

  // Trim the URL and remove query parameters
  const trimmedUrl = youtubeUrl.trim();
  const baseUrl = trimmedUrl.split("?")[0];

  // Extract the 11-character YouTube video ID using regex
  const videoIdMatch = baseUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/i
  );
  console.log("Regex match:", videoIdMatch);

  if (!videoIdMatch) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }
  const videoId = videoIdMatch[1];

  // Convert to canonical URL if it's in youtu.be format
  let canonicalUrl = baseUrl;
  if (baseUrl.includes("youtu.be")) {
    canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  }

  console.log("Extracted Video ID:", videoId);
  console.log("Canonical URL:", canonicalUrl);

  try {
    // Retrieve transcript using RapidAPI with the canonical URL
    const transcriptResponse = await axios.get(
      `https://youtube-transcripts.p.rapidapi.com/youtube/transcript?url=${encodeURIComponent(
        canonicalUrl
      )}&videoId=${videoId}&chunkSize=500`,
      {
        headers: {
          "x-rapidapi-host": "youtube-transcripts.p.rapidapi.com",
          "x-rapidapi-key":
            "c4c4aa15edmsh019100cc1904293p19eba6jsnd83a8a183457",
        },
      }
    );

    // Log the entire API response for debugging purposes
    console.log("Transcript API Response:", transcriptResponse.data);

    // Build the transcript string from the content array
    let transcript = "";
    if (
      transcriptResponse.data.content &&
      transcriptResponse.data.content.length
    ) {
      transcript = transcriptResponse.data.content
        .map((item) => item.text)
        .join(" ");
    }

    // If transcript is still empty or undefined, return an error
    if (!transcript) {
      console.warn("Transcript is missing from the API response.");
      return res.status(400).json({
        error:
          "Transcript not found. This video might not have captions enabled.",
      });
    }

    const derivedNiche = niche || "General";
    const derivedStyle = style || "Neutral";

    // Adjust the prompt for generating a style template for title generation
    const messages = [
      {
        role: "system",
        content: "You are an expert creative prompt generator.",
      },
      {
        role: "user",
        content: `Based on the following YouTube transcript, generate a prompt style template for creating engaging titles. The template should be designed for the "${derivedNiche}" niche with a "${derivedStyle}" tone. It must include creative guidelines such as using an attention-grabbing hook, incorporating vivid imagery, and maintaining a neutral yet inspiring tone. The style template should serve as a blueprint to generate different titles in the future while keeping the essence of the transcript's message in mind.

Transcript:
${transcript}

Please provide only the prompt style template. Do not include extra explanations.`,
      },
    ];

    const responseChat = await client.chat.completions.create({
      messages,
      model: modelName,
      temperature: 0.8,
      max_tokens: 800,
      top_p: 0.95,
    });

    const generatedPrompt = responseChat.choices[0].message.content.trim();

    // Save the generated prompt template in the database
    const newPrompt = new Prompt({
      niche: derivedNiche,
      style: derivedStyle,
      promptTemplate: generatedPrompt,
      created_by: userId,
      is_admin: false,
    });
    await newPrompt.save();

    res.json({
      message: "Dynamic title prompt style generated and saved successfully",
      prompt: newPrompt,
    });
  } catch (error) {
    console.error("Error generating dynamic prompt:", error);
    res.status(500).json({ error: "Error generating dynamic prompt" });
  }
});

// GET: Retrieve a single prompt by its ID
router.get("/prompts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ error: "Prompt not found" });
    }
    res.json(prompt);
  } catch (error) {
    console.error("Error fetching prompt:", error);
    res.status(500).json({ error: "Error fetching prompt" });
  }
});

// POST: Generate a new script with user ID stored
router.post("/generate", async (req, res) => {
  console.log("Received payload:", req.body);
  const { userId, title, promptTemplate, style, length } = req.body;
  console.log(req.body);

  // Set a default niche value since it's required by the schema
  const niche = req.body.niche || "General";

  if (!userId || !title || !promptTemplate || !style || !length) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.tokens < 20) {
      return res
        .status(400)
        .json({ error: "Not enough tokens to generate a new script" });
    }
    user.tokens -= 20;
    await user.save();

    const messages = [
      {
        role: "system",
        content: "You are a creative script writer for YouTube videos.",
      },
      {
        role: "user",
        content: `Create a YouTube script for a ${length} video. The topic is "${title}". Use the following prompt to make the content engaging and informative: ${promptTemplate}. Please provide a complete script that includes only the spoken content of the host without any production instructions, stage directions, annotations, or formatting cues.`,
      },
    ];
    let responseChat = await client.chat.completions.create({
      messages,
      model: modelName,
      temperature: 0.8,
      max_tokens: 1500,
      top_p: 0.95,
    });

    let generatedScript = responseChat.choices[0].message.content.trim();

    if (
      !generatedScript.toLowerCase().includes("end") &&
      generatedScript.length < 2500
    ) {
      messages.push({
        role: "assistant",
        content: generatedScript,
      });
      messages.push({
        role: "user",
        content:
          "The script seems incomplete. Please continue from where it left off, ensuring the script remains solid and does not include any production instructions or stage directions.",
      });

      responseChat = await client.chat.completions.create({
        messages,
        model: modelName,
        temperature: 0.8,
        max_tokens: 1500,
        top_p: 0.95,
      });

      const continuation = responseChat.choices[0].message.content.trim();
      generatedScript += "\n" + continuation;
    }

    const script = new Script({
      userId,
      title,
      content: generatedScript,
      promptTemplate,
      style,
      niche,
      status: "unused",
    });
    await script.save();
    res.json({ message: "Script generated successfully", script });
  } catch (error) {
    console.error("Error generating script:", error);
    res.status(500).json({ error: "Error generating script" });
  }
});

// POST: Rephrase an existing script
router.post("/rephrase", async (req, res) => {
  const { userId, scriptId, style } = req.body;
  if (!userId || !scriptId || !style) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.tokens < 5) {
      return res
        .status(400)
        .json({ error: "Not enough tokens to rephrase the script" });
    }

    const originalScript = await Script.findById(scriptId);
    if (!originalScript) {
      return res.status(404).json({ error: "Script not found" });
    }

    // Look up the prompt template for the script's niche and the provided style.
    const promptTemplateDoc = await Prompt.findOne({
      niche: originalScript.niche,
      style,
    });
    let prompt;
    if (promptTemplateDoc) {
      prompt = promptTemplateDoc.promptTemplate.replace(
        "{{content}}",
        originalScript.content
      );
    } else {
      prompt = `Rephrase the following YouTube script:\n\n${originalScript.content}`;
    }

    // Deduct tokens and save the user.
    user.tokens -= 5;
    await user.save();

    const messages = [
      {
        role: "system",
        content: "You are a professional script editor for YouTube videos.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const responseChat = await client.chat.completions.create({
      messages,
      model: modelName,
      temperature: 0.8,
      max_tokens: 800,
      top_p: 0.95,
    });

    const rephrasedScript = responseChat.choices[0].message.content.trim();
    const baseTitle = originalScript.title.replace(/\s*\(Rephrased\)$/, "");
    const newTitle = `${baseTitle} (Rephrased)`;

    const newScript = new Script({
      userId,
      title: newTitle,
      content: rephrasedScript,
      niche: originalScript.niche,
      style,
      status: "unused",
    });
    await newScript.save();

    res.json({ message: "Script rephrased successfully", script: newScript });
  } catch (error) {
    console.error("Error rephrasing script:", error);
    res.status(500).json({ error: "Error rephrasing script" });
  }
});

// POST: Rephrase preview
router.post("/rephrase-preview", async (req, res) => {
  const { userId, scriptId, style } = req.body;
  console.log("rephrase-preview", req.body);
  if (!userId || !scriptId || !style) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const originalScript = await Script.findById(scriptId);
    if (!originalScript)
      return res.status(404).json({ error: "Script not found" });

    // Look up a prompt template for the given style if available
    const promptTemplateDoc = await Prompt.findOne({
      niche: originalScript.niche,
      style,
    });

    let prompt;
    if (promptTemplateDoc) {
      if (promptTemplateDoc.promptTemplate.includes("{{content}}")) {
        prompt = promptTemplateDoc.promptTemplate.replace(
          "{{content}}",
          originalScript.content
        );
      } else {
        prompt = `${promptTemplateDoc.promptTemplate}\n\n${originalScript.content}`;
      }
    } else {
      prompt = `Please rephrase the following YouTube script in a formal tone. Do not ask any clarifying questions—simply output the rephrased script:\n\n${originalScript.content}`;
    }

    console.log("Final prompt (combined style + script):", prompt);
    const messages = [
      {
        role: "system",
        content: "You are a professional script editor for YouTube videos.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];
    console.log("Messages sent to OpenAI API:", messages);

    const responseChat = await client.chat.completions.create({
      messages,
      model: modelName,
      temperature: 0.8,
      max_tokens: 800,
      top_p: 0.95,
    });

    const rephrasedScript = responseChat.choices[0].message.content.trim();
    const baseTitle = originalScript.title.replace(/\s*\(Rephrased\)$/, "");
    const newTitle = `${baseTitle} (Rephrased)`;

    res.json({
      message: "Script rephrased preview",
      script: { title: newTitle, content: rephrasedScript },
    });
  } catch (error) {
    console.error("Error generating rephrase preview:", error);
    res.status(500).json({ error: "Error generating rephrase preview" });
  }
});

// POST: Rephrase and save
router.post("/rephrase-save", async (req, res) => {
  const { userId, scriptId, title, content } = req.body;
  if (!userId || !scriptId || !title || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.tokens < 5) {
      return res
        .status(400)
        .json({ error: "Not enough tokens to rephrase the script" });
    }

    const originalScript = await Script.findById(scriptId);
    if (!originalScript)
      return res.status(404).json({ error: "Script not found" });

    user.tokens -= 5;
    await user.save();

    const newScript = new Script({
      userId,
      title,
      content,
      niche: originalScript.niche,
      style: originalScript.style,
      status: "unused",
    });
    await newScript.save();

    res.json({
      message: "Script rephrased and saved successfully",
      script: newScript,
    });
  } catch (error) {
    console.error("Error saving rephrased script:", error);
    res.status(500).json({ error: "Error saving rephrased script" });
  }
});

//
// === Dynamic Routes (These must come last) ===
//

// GET: Fetch a specific script by its ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const script = await Script.findById(id);
    if (!script) {
      return res.status(404).json({ error: "Script not found" });
    }
    res.json(script);
  } catch (error) {
    console.error("Error fetching script:", error);
    res.status(500).json({ error: "Error fetching script" });
  }
});

// PATCH: Update a script's title and content (for editing)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const updatedScript = await Script.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
    if (!updatedScript) {
      return res.status(404).json({ error: "Script not found" });
    }
    res.json(updatedScript);
  } catch (error) {
    console.error("Error updating script:", error);
    res.status(500).json({ error: "Error updating script" });
  }
});

// PATCH: Mark a script as used
router.patch("/:id/mark-used", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedScript = await Script.findByIdAndUpdate(
      id,
      { status: "used" },
      { new: true }
    );
    if (!updatedScript) {
      return res.status(404).json({ error: "Script not found" });
    }
    res.json(updatedScript);
  } catch (error) {
    console.error("Error updating script status:", error);
    res.status(500).json({ error: "Error updating script status" });
  }
});

// DELETE: Delete a script by its ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const script = await Script.findByIdAndDelete(id);
    if (!script) {
      return res.status(404).json({ error: "Script not found" });
    }
    res.json({ message: "Script deleted successfully" });
  } catch (error) {
    console.error("Error deleting script:", error);
    res.status(500).json({ error: "Error deleting script" });
  }
});

export default router;
