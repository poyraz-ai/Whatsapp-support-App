import express from "express";
import dotenv from "dotenv";
import { BUSINESSES } from "./businesses.js";
import { getAIResponse } from "./ai.js";
import { sendWhatsAppMessage } from "./whatsapp.js";

dotenv.config();
const app = express();
app.use(express.json());

// WhatsApp Verifizierung
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Nachrichten empfangen
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body?.toLowerCase();

    const business = BUSINESSES["default"];

    // Eskalation prüfen
    if (business.handover_keywords.some(k => text.includes(k))) {
      await sendWhatsAppMessage(from, business.human_contact);
      return res.sendStatus(200);
    }

    const aiReply = await getAIResponse(text, business);
    await sendWhatsAppMessage(from, aiReply);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("🤖 WhatsApp Support Bot läuft auf Port 3000");
});
