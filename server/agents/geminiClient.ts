import dotenv from 'dotenv';
dotenv.config();

export interface GeminiCallOptions {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: Record<string, any>;
  temperature?: number;
}

export class GeminiClient {
  private apiKey: string;
  private endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  public setApiKey(key: string) {
    this.apiKey = key;
  }

  public get hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  public async generateJSON<T = any>(options: GeminiCallOptions): Promise<{ data: T; latencyMs: number } | null> {
    if (!this.hasApiKey) {
      return null;
    }

    const startTime = Date.now();
    try {
      const url = `${this.endpoint}?key=${this.apiKey}`;
      const payload: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: options.prompt }]
          }
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          responseMimeType: 'application/json'
        }
      };

      if (options.systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: options.systemInstruction }]
        };
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[GeminiClient] API responded with status ${response.status}: ${errorText}`);
        return null;
      }

      const result = await response.json();
      const latencyMs = Date.now() - startTime;
      const textContent = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        return null;
      }

      const parsed = JSON.parse(textContent) as T;
      return { data: parsed, latencyMs };
    } catch (err: any) {
      console.warn('[GeminiClient] LLM call failed or timed out:', err?.message || err);
      return null;
    }
  }

  public async generateText(prompt: string, systemInstruction?: string): Promise<{ text: string; latencyMs: number } | null> {
    if (!this.hasApiKey) {
      return null;
    }

    const startTime = Date.now();
    try {
      const url = `${this.endpoint}?key=${this.apiKey}`;
      const payload: any = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      };

      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) return null;

      const result = await response.json();
      const latencyMs = Date.now() - startTime;
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text, latencyMs };
    } catch (err: any) {
      console.warn('[GeminiClient] Text generation failed:', err?.message || err);
      return null;
    }
  }
}

export const geminiClient = new GeminiClient();
