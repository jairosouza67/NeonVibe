import { GoogleGenAI } from "@google/genai";
import { Message, AISettings } from "../types";

/**
 * Edits an image using Gemini 2.5 Flash Image based on a text prompt.
 * NOTE: Currently hardcoded to use Gemini as it handles image input natively and reliably.
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  apiKey?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is required for image editing. Please configure it in Settings.");
  }
  
  try {
    const client = new GoogleGenAI({ apiKey });

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    throw error;
  }
};

/**
 * Streams the generation of a web application based on chat history.
 * Supports both Gemini and OpenRouter based on settings.
 */
export async function* streamAppGeneration(history: Message[], settings: AISettings) {
  if (settings.provider === 'openrouter') {
    yield* streamOpenRouter(history, settings);
  } else {
    yield* streamGemini(history, settings);
  }
}

// --- Gemini Implementation ---

async function* streamGemini(history: Message[], settings: AISettings) {
  if (!settings.apiKey) {
    throw new Error("API Key is required. Please configure it in Settings.");
  }
  
  try {
    const client = new GoogleGenAI({ apiKey: settings.apiKey });

    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const responseStream = await client.models.generateContentStream({
      model: settings.model || 'gemini-2.5-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: getSystemPrompt(),
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error streaming Gemini:", error);
    throw error;
  }
}

// --- OpenRouter Implementation ---

async function* streamOpenRouter(history: Message[], settings: AISettings) {
  if (!settings.apiKey) {
    throw new Error("OpenRouter API Key is required");
  }

  const messages = [
    { role: 'system', content: getSystemPrompt() },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content
    }))
  ];

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${settings.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: settings.model || "anthropic/claude-3.5-sonnet",
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter Error: ${err}`);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          if (data === "[DONE]") return;
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            console.error("Error parsing OpenRouter stream chunk", e);
          }
        }
      }
    }

  } catch (error) {
    console.error("Error streaming OpenRouter:", error);
    throw error;
  }
}

function getSystemPrompt() {
    return `You are an expert Frontend Engineer and UI/UX Designer. 
        Your goal is to build a web application based on the user's request. 
        
        Rules:
        1. You must act like a real repository generator. 
        2. Instead of a single HTML file, you must output MULTIPLE files (index.html, styles.css, script.js, etc) as needed.
        3. Encapsulate each file's content in a custom XML tag like this:
           <file name="filename.ext">
           ... content ...
           </file>
        4. ALWAYS include an "index.html".
        5. In "index.html", use RELATIVE linking for CSS and JS (e.g., <link rel="stylesheet" href="styles.css">, <script src="script.js"></script>).
        6. Use a modern, neon, dark-themed aesthetic (similar to the 'NeonVibe' brand) unless requested otherwise.
        7. Use Tailwind CSS via CDN in index.html for base styling, but use 'styles.css' for custom neon effects if needed.
        8. Include a README.md explaining how to run the project.
        9. Reply conversationally at the start, then provide the files.
        
        Example output format:
        "Sure, here is the code for your dashboard...
        
        <file name="index.html">
        <!DOCTYPE html>
        <html>
          <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="styles.css">
          </head>
          <body>...</body>
        </html>
        </file>
        
        <file name="styles.css">
        .neon-box { border: 1px solid #0f0; }
        </file>
        "
        `;
}
