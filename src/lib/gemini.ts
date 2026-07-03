// Server-side Gemini extraction. The API key lives in process.env and never
// reaches the browser.
const RESUME_PROMPT =
  "You are an expert résumé and candidate-profile parser. From the supplied document or text, extract the candidate's details. " +
  "Respond with ONLY a single minified JSON object and nothing else — no markdown, no code fences, no commentary. " +
  "Use exactly these keys: name (string), email (string), phone (string), location (string, city or region), " +
  "role (string — the job title that best fits this person, inferred from their most recent or primary role), " +
  "experience (number — total years of professional experience, 0 if unknown), skills (array of short skill keyword strings). " +
  "For any unknown field use an empty string, 0, or an empty array.";

export async function geminiExtract(input: { text?: string; base64Pdf?: string }) {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set on the server.");
  const model = (process.env.GEMINI_MODEL || "").trim() || "gemini-2.0-flash";

  const parts: any[] = [{ text: RESUME_PROMPT }];
  if (input.base64Pdf) {
    parts.push({ inline_data: { mime_type: "application/pdf", data: input.base64Pdf } });
  } else {
    parts.push({ text: "\n\nDOCUMENT:\n" + String(input.text || "").slice(0, 12000) });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini request failed (${res.status})`);
  const data: any = await res.json();
  const out: string = (data?.candidates?.[0]?.content?.parts || [])
    .map((p: any) => p.text || "")
    .join("")
    .trim();
  const a = out.indexOf("{");
  const b = out.lastIndexOf("}");
  return JSON.parse(a >= 0 && b >= 0 ? out.slice(a, b + 1) : out);
}
