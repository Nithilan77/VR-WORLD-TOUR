// server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON + static files
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ---------------- AI Request Handler ----------------
app.post("/api/assistant", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ reply: "Message is required." });
  }

  try {
    // Gemini expects just text, not role/parts
    const result = await model.generateContent(message);
    const reply = result.response.text();

    return res.json({ reply });
  } catch (err) {
    console.error("⚠️ Gemini failed:", err.message);
    return res.json({
      reply: "Sorry, AI is currently unavailable. Please try again later."
    });
  }
});
// ---------------------------------------------------

// SPA fallback (serve index.html for all other routes)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
