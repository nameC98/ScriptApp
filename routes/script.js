import express from "express";
import User from "../models/User.js";
import Script from "../models/Script.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import Prompt from "../models/Prompt.js";

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

//
// === Static Routes (Non-dynamic) ===
//

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
  // Optional query parameters: startDate and endDate (in YYYY-MM-DD format)
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

//
// === Prompt Template Endpoints ===
//

// POST: Create a new prompt template
router.post("/prompt", async (req, res) => {
  const { niche, style, promptTemplate } = req.body;
  if (!niche || !style || !promptTemplate) {
    return res.status(400).json({
      error: "Missing required fields: niche, style, and promptTemplate",
    });
  }
  try {
    const newPrompt = new Prompt({ niche, style, promptTemplate });
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

// PATCH: Edit an existing prompt template
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

// DELETE: Delete a prompt template
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

// GET: Retrieve all prompt templates
router.get("/prompts", async (req, res) => {
  try {
    const prompts = await Prompt.find();
    res.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({ error: "Error fetching prompts" });
  }
});

//
// === Script Generation & Rephrasing Routes ===
//

// POST: Generate a new script with user ID stored and chain requests if needed
router.post("/generate", async (req, res) => {
  console.log("Received payload:", req.body); // Log the incoming data

  const { userId, niche, title, style, length } = req.body;
  if (!userId || !niche || !title || !style || !length) {
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

    // Build your messages and log them if needed:
    const messages = [
      {
        role: "system",
        content: "You are a creative script writer for YouTube videos.",
      },
      {
        role: "user",
        content: `Create a YouTube script for a ${length} video in the ${niche} niche. The topic is "${title}". Use a ${style} prompt to make the content engaging and informative. Please provide a complete script that includes only the spoken content of the host without any production instructions, stage directions, annotations, or formatting cues.`,
      },
    ];
    console.log("Messages sent to AI:", messages);

    // First generation call
    let responseChat = await client.chat.completions.create({
      messages,
      model: modelName,
      temperature: 0.8,
      max_tokens: 1500,
      top_p: 0.95,
    });

    let generatedScript = responseChat.choices[0].message.content.trim();
    console.log("Initial generated script:", generatedScript);

    // Check if the script might be cut off. If yes, continue generating.
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

      // Second generation call to continue the script
      responseChat = await client.chat.completions.create({
        messages,
        model: modelName,
        temperature: 0.8,
        max_tokens: 1500,
        top_p: 0.95,
      });

      const continuation = responseChat.choices[0].message.content.trim();
      console.log("Continuation generated script:", continuation);
      generatedScript += "\n" + continuation;
    }

    // Create and save the script in your database (timestamps will be added automatically)
    const script = new Script({
      userId,
      title,
      content: generatedScript,
      niche,
      style,
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

// POST: Admin creates a new public script
router.post("/admin", async (req, res) => {
  const { userId, title, content, niche, snippet, style } = req.body;
  if (!userId || !title || !content || !niche || !style) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const script = new Script({
      userId,
      title,
      content,
      niche,
      style,
      snippet,
      status: "unused",
      isAdmin: true,
    });
    await script.save();
    res.json({ message: "Admin script posted successfully", script });
  } catch (error) {
    console.error("Error posting admin script:", error);
    res.status(500).json({ error: "Error posting admin script" });
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
