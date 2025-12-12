import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Tone, Dialect, GrammarResponse } from "../types";

const correctionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    rewrittenText: {
      type: Type.STRING,
      description: "The fully rewritten text in HTML format, preserving original tags and structure.",
    },
    feedback: {
      type: Type.STRING,
      description: "A short, general comment from the 'Grammar Police' persona about the user's writing.",
    },
    corrections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          correction: { type: Type.STRING },
          explanation: { type: Type.STRING },
          type: {
            type: Type.STRING,
            enum: ['spelling', 'grammar', 'tone', 'punctuation']
          },
          examples: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "1-2 short, clear sentences demonstrating the correct usage of the rule or word in the requested dialect."
          }
        },
        required: ["original", "correction", "explanation", "type", "examples"],
      },
    },
  },
  required: ["rewrittenText", "feedback", "corrections"],
};

export const correctGrammar = async (
  text: string,
  tone: Tone,
  dialect: Dialect,
  apiKey: string
): Promise<GrammarResponse> => {
  const ai = new GoogleGenAI({ apiKey });

  const isBritish = dialect === Dialect.BRITISH;
  const personaName = isBritish
    ? "Chief Inspector Punctuation of the Royal Grammar Police"
    : "Sheriff Syntax of the Grammar Patrol";

  const spellingExamples = isBritish
    ? "'colour', 'theatre', 'analyse', 'programme'"
    : "'color', 'theater', 'analyze', 'program'";

  const personaToneDescription = isBritish
    ? "polite, authoritative, stiff upper lip British"
    : "firm, direct, folksy but professional American";

  const systemInstruction = `
    You are ${personaName}.
    You are a native ${dialect} English expert.
    Your job is to correct the user's text, enforcing strict ${dialect} English spelling (e.g., ${spellingExamples}) and grammar.

    You must also adapt the text to the requested tone: ${tone}.

    IMPORTANT: The input text is provided in HTML.
    - You MUST preserve all HTML tags (e.g., <b>, <i>, <ul>, <li>, <br>) and the overall structure.
    - Do not strip the tags.
    - Only correct the text content INSIDE the tags.
    - If the user's input is plain text, you may add HTML tags (like <p>, <b>) where appropriate to improve readability.
    - The 'rewrittenText' in the JSON response MUST be valid HTML.

    Correction Detail Guidelines:
    - For each correction, provide 'examples': a list of 1-2 short sentences showing how to correctly use the word or grammar rule in a ${dialect} context.

    Tone Guidelines:
    - 'Original (Grammar Fix Only)': Maintain the user's original style, voice, and intent exactly. Only fix objective grammar, spelling, and punctuation errors.
    - 'Chat (Casual/WhatsApp)': Rewrite as a casual instant message. Use ${dialect} slang if appropriate.
    - 'Email (Professional)': Rewrite as a professional email. Polite, clear, structured.
    - 'Speaking (Natural Flow)': Rewrite for speech. Focus on rhythm and flow.

    Persona Guidelines:
    - Always provide the 'feedback' as ${personaName} (${personaToneDescription}).
    - Analyze the text carefully. Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Please correct and rewrite the following text.\n\nText: "${text}"`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: correctionSchema,
      temperature: 0.7,
    },
  });

  const jsonText = response.text;
  if (!jsonText) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(jsonText) as GrammarResponse;
};
