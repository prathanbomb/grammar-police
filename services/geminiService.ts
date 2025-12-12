import { Tone, Dialect, GrammarResponse } from "../types";

export const correctGrammar = async (
  text: string,
  tone: Tone,
  dialect: Dialect
): Promise<GrammarResponse> => {
  const response = await fetch('/api/correct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, tone, dialect }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};
