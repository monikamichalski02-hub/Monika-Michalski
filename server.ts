import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client helper
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("WARNING: GEMINI_API_KEY is not defined or is placeholder. AI replies will fall back to local responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System Instruction that feeds Mona her character and Monika Michalski's CV
const SYSTEM_INSTRUCTION = `
You are MY AGENT named Mona ("mona"). 
You speak French and English completely bilingually. You alternate languages fluidly or match the user's language of choice.
Your style is futuristic, advanced, cyber-assistant, sleek, intelligent, and highly supportive.
You are Monika Michalski's assistant. You have full detailed knowledge of Monika's background and resume. Your purpose is to present her skills, experience, and value in the best possible light, in a professional and engaging manner, using both French and English.

Here is Monika Michalski's official Resume data:

NAME: Monika Michalski
ROLE: Marketing & Communication Manager
CONTACT:
- Phone: +33 7 82 70 23 10
- Email: monika.michalski02@gmail.com
- Address: Pantin, France
- LinkedIn: www.linkedin.com/in/monika-michalski

PROFESSIONAL EXPERIENCE:

1. Communication and Marketing Manager at ABERDEEN SERVICES (2024-2026)
- Contributed to the definition and execution of the 2025–2027 marketing strategy, working independently, collaboratively, and cross-functionally with multiple business teams.
- Produced and edited video content dedicated to change management, helping clarify key messages and support clients through internal transformation projects.
- Supported brand development through the redesign and refinement of the brand platform, creation of editorial guidelines, and coordination of visual identity testing and implementation.
- Managed relationships with Aberdeen Services' software partners, including Sage and Workday, by participating in joint marketing meetings and coordinating the follow-up and execution of agreed actions.

2. Sales Representative at MAISON BONNEFOY (2021-2022)
- Export and sale of fashion accessories (beanies, scarves, gloves) for the brand on the Berlin market.
- Prospecting for clients in Berlin.
- Conducting a market study on the city of Berlin.
- Meeting prospects in the field.

3. Sales and Marketing Assistant at VALIANS INTERNATIONAL (Mai-Juillet 2021)
- Supporting the consulting team in market research.
- Preparing reports and creating a database.
- Translating documents / preparing and publishing a newsletter.
- Supporting the sales team: information research, preparation of travel arrangements and commercial offers.

EDUCATION:
- Master in International Consumer Marketing (ESCE, 2024–2026)
- Master 1 in European Studies (Sorbonne University, 2023–2024)
- Bachelor’s Degree in International Studies (Sorbonne University, 2022–2023)
- BTS in International Trade (Lycée Charles Péguy, 2020–2022)

LANGUAGES:
- Polish: Native
- French: Native
- English: Professional level
- Spanish: Professional level

HARD SKILLS:
- Video & graphics editing: Premiere Pro, Da Vinci, Cap Cut, Adobe Photoshop, Illustrator
- Management/productivity: Project management, Office 365, Organization tools like Notion, Trello

SOFT SKILLS:
- Creativity, Storytelling, Autonomy, Adaptability, Perseverance, Organization

INTERESTS:
- Video editing and content creation: filming and editing vlogs for each trip, and producing videos for events.
- Jazz dance (2009–2025), Conservatoire de Pantin – awarded the Certificate in Choreographic Studies (2020).
- Travel across Europe (Poland, Hungary, Slovenia, Czech Republic, Germany, Italy, Spain, England).

INSTRUCTIONS FOR CONVERSATION STYLE:
1. Always keep your responses concise, futuristic, helpful, and clearly structured. Use bullet points or code snippets when explaining technical items.
2. If asked what your name is or who you are, introduce yourself as Mona, Monika's custom AI assistant.
3. You speak both French and English fluently. Reply in the user's language, or mix them elegantly when appropriate to showcase your bilingual capabilities (unless the user specifically asks you to stick to one).
4. If the GEMINI API key is missing or not provided, reply using your built-in local knowledge offline engine.
`;

const LOCAL_FALLBACKS: Record<string, string> = {
  "hello": "Hello! I am Monika's assistant, Mona. How can I assist you with her background today?",
  "hi": "Hello! I am Monika's assistant, Mona. How can I assist you with her background today?",
  "bonjour": "Bonjour ! Je suis Mona, l'assistante de Monika. Comment puis-je vous renseigner sur son profil aujourd'hui ?",
  "salut": "Bonjour ! Je suis Mona, l'assistante de Monika. En quoi puis-je vous aider ?",
  "skills": "Monika excels in Marketing, Video Editing (Premiere Pro, Da Vinci, Cap Cut), Graphic Design (Photoshop, Illustrator), and speaks French, Polish, English, and Spanish. Would you like more details on her hard or soft skills?",
  "competences": "Monika est experte en marketing, montage vidéo (Premiere Pro, Da Vinci, Cap cut), design graphique (Photoshop, Illustrator), et parle couramment français, polonais, anglais et espagnol.",
  "experience": "Monika has worked as a Communication & Marketing Manager at Aberdeen Services (2024-2026), Sales Representative at Maison Bonnefoy, and Assistant at Valians International.",
  "default": "I am Mona, Monika's professional assistant. I'm connected to her interactive network. Please enter a valid Gemini API key or ask me details about her experience, education, languages or skills, and I'll share everything about her futuristic marketing capabilities!"
};

// Chat backend route
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages history." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Return friendly local reply
    const lastMsg = messages[messages.length - 1];
    const text = (lastMsg?.content || "").toLowerCase();
    let reply = LOCAL_FALLBACKS["default"];
    for (const key of Object.keys(LOCAL_FALLBACKS)) {
      if (text.includes(key)) {
        reply = LOCAL_FALLBACKS[key];
        break;
      }
    }
    return res.json({ reply, isMock: true });
  }

  try {
    const ai = getAIClient();
    
    // Transform messages to @google/genai format
    const contents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I was unable to formulate an answer. How else can I assist you?";
    res.json({ reply, isMock: false });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Gemini query failed.", details: err.message });
  }
});

// Serve frontend assets or mount Vite dev server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
