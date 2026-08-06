import { NextResponse } from "next/server";

type CategoryPayload = {
  id: string;
  name: string;
  type: "income" | "expense";
};

type GeminiParsedResult = {
  amount: number;
  type: "income" | "expense";
  description: string;
  categoryId: string;
  confidence: number;
  date?: string;
};

/**
 * Models to try in order. If one returns 429 (quota exhausted),
 * the next model in the chain is attempted automatically.
 */
const MODEL_CHAIN = [
  "gemini-flash-latest",
];

function buildPromptPayload(systemPrompt: string, userMessage: string) {
  return {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\n" + userMessage }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          amount: { type: "NUMBER" },
          type: { type: "STRING", enum: ["income", "expense"] },
          description: { type: "STRING" },
          categoryId: { type: "STRING" },
          confidence: { type: "NUMBER" },
          date: { type: "STRING" },
        },
        required: [
          "amount",
          "type",
          "description",
          "categoryId",
          "confidence",
          "date",
        ],
      },
    },
  };
}

function sanitizeParsedResult(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsed: any,
  refDate: string,
): GeminiParsedResult {
  return {
    amount:
      typeof parsed.amount === "number"
        ? parsed.amount
        : Number(parsed.amount) || 0,
    type: parsed.type === "income" ? "income" : "expense",
    description: String(parsed.description || ""),
    categoryId: String(parsed.categoryId || ""),
    confidence:
      typeof parsed.confidence === "number" ? parsed.confidence : 0.85,
    date:
      typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
        ? parsed.date
        : refDate,
  };
}

function extractAndParseJson(
  rawText: string,
  refDate: string,
): GeminiParsedResult | null {
  // Strip markdown code fences like ```json ... ```
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Try standard JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      return sanitizeParsedResult(parsed, refDate);
    }
  } catch {
    // Try extracting substring between first { and last }
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (parsed && typeof parsed === "object") {
          return sanitizeParsedResult(parsed, refDate);
        }
      } catch {
        // Fallback regex extraction below
      }
    }

    // Advanced recovery for truncated JSON
    try {
      const amountMatch = cleaned.match(/"amount"\s*:\s*(\d+)/);
      const typeMatch = cleaned.match(/"type"\s*:\s*"(income|expense)"/);
      const descMatch = cleaned.match(/"description"\s*:\s*"([^"]+)"/);
      const catMatch = cleaned.match(/"categoryId"\s*:\s*"([^"]+)"/);
      const dateMatch = cleaned.match(/"date"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);

      if (amountMatch || descMatch || catMatch) {
        return {
          amount: amountMatch ? Number(amountMatch[1]) : 0,
          type: (typeMatch?.[1] as "income" | "expense") || "expense",
          description: descMatch ? descMatch[1] : "",
          categoryId: catMatch ? catMatch[1] : "",
          confidence: 0.85,
          date: dateMatch ? dateMatch[1] : refDate,
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}

async function callGemini(
  model: string,
  apiKey: string,
  payload: ReturnType<typeof buildPromptPayload>,
  refDate: string,
): Promise<
  | { ok: true; data: GeminiParsedResult }
  | { ok: false; status: number; retryable: boolean; message: string }
> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const retryable = response.status === 429 || response.status === 503;
    console.error(
      `[Gemini ${model}] ${response.status}:`,
      errorText.slice(0, 200),
    );
    return {
      ok: false,
      status: response.status,
      retryable,
      message: `Gemini ${model}: ${response.status}`,
    };
  }

  const geminiData = await response.json();
  const textContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    return {
      ok: false,
      status: 502,
      retryable: false,
      message: `Gemini ${model}: empty response`,
    };
  }

  const parsed = extractAndParseJson(textContent, refDate);
  if (parsed) {
    return { ok: true, data: parsed };
  }

  console.error(`[Gemini ${model}] Failed to parse JSON. Raw text:`, textContent);
  return {
    ok: false,
    status: 502,
    retryable: false,
    message: `Gemini ${model}: invalid JSON`,
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured. Please add it to .env.local",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      prompt: string;
      categories: CategoryPayload[];
      currentDate?: string;
    };

    const { prompt, categories, currentDate } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 },
      );
    }

    // Reference date for date calculation (YYYY-MM-DD)
    const refDate = currentDate || new Date().toISOString().slice(0, 10);

    // Build the category list string for the prompt
    const categoryList = categories
      .map((c) => `- id: "${c.id}", name: "${c.name}", type: "${c.type}"`)
      .join("\n");

    const systemPrompt = `Kamu adalah AI asisten keuangan pintar untuk aplikasi pencatatan keuangan Indonesia (FinTrack).
Tugasmu adalah mengekstrak informasi transaksi dari input pengguna dalam bahasa Indonesia sehari-hari.

Dari input pengguna, ekstrak:
1. **amount** (number): Nominal uang. Pahami format:
   - "150rb" atau "150 ribu" = 150000
   - "1.5jt" atau "1,5 juta" = 1500000
   - "25k" = 25000
   - "150000" = 150000
   - Jika tidak ada nominal, kembalikan 0

2. **type** ("income" | "expense"): Tipe transaksi.
   - Kata kunci pemasukan: gaji, pendapatan, bonus, jual, penjualan, omset, terima, masuk, transfer masuk, cair, pencairan, freelance, komisi, dividen
   - Kata kunci pengeluaran: beli, bayar, buat, langganan, ongkir, kirim, paket, makan, kopi, bensin, parkir, sewa
   - Default: "expense" jika ambigu

3. **description** (string): Deskripsi singkat & rapi untuk catatan transaksi. Buat kalimat ringkas yang jelas, capitalize huruf pertama. Contoh: "Beli kopi di Starbucks", "Gaji bulan Agustus".

4. **categoryId** (string): Pilih kategori yang paling cocok dari daftar ini:
${categoryList}
   - Pilih berdasarkan konteks input, bukan hanya keyword matching
   - Jika tidak ada yang cocok, pilih yang paling mendekati

5. **date** (string format "YYYY-MM-DD"): Tanggal transaksi.
   - Tanggal acuan HARI INI adalah: ${refDate}
   - Jika pengguna menyebutkan waktu relatif (seperti "3 hari lalu", "kemarin", "2 hari yang lalu", "minggu lalu", "lusa", dsb.) atau tanggal spesifik (seperti "10 Agustus", "tanggal 5"), hitung dan kembalikan tanggal dalam format YYYY-MM-DD.
   - Jika pengguna TIDAK menyebutkan tanggal/waktu relatif atau spesifik, kembalikan tanggal hari ini: "${refDate}".

6. **confidence** (number 0-1): Tingkat keyakinan parsing (contoh: 0.9).

PENTING:
- Selalu kembalikan JSON valid tanpa markdown fence
- Jangan menambahkan komentar di luar JSON
- Pastikan categoryId yang dikembalikan ada dalam daftar kategori di atas
- Format date HARUS "YYYY-MM-DD"`;

    const userMessage = `Parse transaksi ini: "${prompt}"`;
    const payload = buildPromptPayload(systemPrompt, userMessage);

    // Try each model in the chain; stop on first success or non-retryable error
    let lastError = "";
    for (const model of MODEL_CHAIN) {
      const result = await callGemini(model, apiKey, payload, refDate);

      if (result.ok) {
        const parsed = result.data;

        // Validate that the categoryId exists in provided categories
        const validCategory = categories.find(
          (c) => c.id === parsed.categoryId,
        );
        if (!validCategory && categories.length > 0) {
          const fallback =
            categories.find((c) => c.type === parsed.type) ?? categories[0];
          parsed.categoryId = fallback.id;
          parsed.confidence = Math.min(parsed.confidence, 0.6);
        }

        return NextResponse.json(parsed);
      }

      lastError = result.message;

      // Only try the next model if the error was retryable (429 / 503)
      if (!result.retryable) {
        break;
      }

      console.warn(`[AI] ${model} quota exhausted, trying next model...`);
    }

    return NextResponse.json(
      { error: lastError || "All Gemini models failed" },
      { status: 502 },
    );
  } catch (error) {
    console.error("[AI Parse Route Error]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
