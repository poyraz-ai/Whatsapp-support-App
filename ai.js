import axios from "axios";
import { CONFIG } from "./config.js";

export async function getAIResponse(message, business) {
  const systemPrompt = `
Du bist ein WhatsApp-Kundensupport für "${business.name}".

Regeln:
- Antworte IMMER auf Deutsch
- Sei ${business.tone}
- Erfinde KEINE Infos
- Wenn unsicher → leite an Mitarbeiter weiter
- Öffnungszeiten: ${business.opening_hours}
- Leistungen: ${business.services.join(", ")}

Wenn eine Anfrage nicht klar beantwortbar ist, sage:
"${business.human_contact}"
`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: CONFIG.model,
      temperature: CONFIG.temperature,
      max_tokens: CONFIG.max_tokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
}
