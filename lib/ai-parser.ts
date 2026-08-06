import type { CategoryRecord, EntityType } from "@/lib/finance";

export type ParsedAiTransaction = {
  amount: number;
  type: EntityType;
  description: string;
  categoryId: string;
  confidence: number;
  aiReasoning?: string;
  date?: string;
};

/**
 * Calls the server-side Gemini API route to parse a natural language
 * transaction prompt into structured data.
 */
export async function parseWithGemini(
  prompt: string,
  categories: CategoryRecord[],
  currentDate?: string,
): Promise<ParsedAiTransaction> {
  const response = await fetch("/api/ai-parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
      })),
      currentDate,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      (errorData as { error?: string })?.error ??
      `AI request failed (${response.status})`;
    throw new Error(message);
  }

  return (await response.json()) as ParsedAiTransaction;
}

function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Local regex-based fallback parser (no API call needed).
 * Used when Gemini API is unavailable or as instant offline fallback.
 */
export function parseNaturalLanguageTransaction(
  prompt: string,
  categories: CategoryRecord[],
  currentDate?: string,
): ParsedAiTransaction {
  const text = prompt.trim();
  const now = currentDate ? new Date(currentDate) : new Date();
  const defaultDateStr = formatDateISO(now);

  if (!text) {
    return {
      amount: 0,
      type: "expense",
      description: "",
      categoryId: categories[0]?.id ?? "",
      confidence: 0,
      date: defaultDateStr,
    };
  }

  const textLower = text.toLowerCase();

  // 1. Detect Type (income vs expense)
  const incomeKeywords = [
    "gaji",
    "pendapatan",
    "pencairan",
    "cair",
    "transfer masuk",
    "bonus",
    "jual",
    "penjualan",
    "tiktok",
    "tokopedia",
    "shopee",
    "omset",
    "dapat",
    "terima",
    "masuk",
  ];

  let type: EntityType = "expense";
  if (incomeKeywords.some((keyword) => textLower.includes(keyword))) {
    type = "income";
  }

  // 2. Parse Amount (handles 150 ribu, 150rb, 25k, 1.5 juta, 150000)
  let amount = 0;

  // Match numbers followed by 'juta' or 'jt'
  const jutaMatch = textLower.match(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)/);
  if (jutaMatch) {
    const rawNum = jutaMatch[1].replace(",", ".");
    amount = Math.round(parseFloat(rawNum) * 1_000_000);
  } else {
    // Match numbers followed by 'ribu' or 'rb' or 'k'
    const ribuMatch = textLower.match(/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k\b)/);
    if (ribuMatch) {
      const rawNum = ribuMatch[1].replace(",", ".");
      amount = Math.round(parseFloat(rawNum) * 1_000);
    } else {
      // Direct numbers like 150000
      const numberMatch = textLower.match(/\b\d{4,9}\b/);
      if (numberMatch) {
        amount = parseInt(numberMatch[0], 10);
      } else {
        const smallNum = textLower.match(/\b\d{1,3}\b/);
        if (smallNum && (textLower.includes("ribu") || textLower.includes("rb"))) {
          amount = parseInt(smallNum[0], 10) * 1_000;
        }
      }
    }
  }

  // 3. Match Category
  const availableCategories = categories.filter((c) => c.type === type);
  let matchedCategory: CategoryRecord | null = null;

  for (const cat of availableCategories) {
    const catNameLower = cat.name.toLowerCase();
    if (textLower.includes(catNameLower)) {
      matchedCategory = cat;
      break;
    }
  }

  // Fallback category keyword heuristics
  if (!matchedCategory) {
    if (type === "expense") {
      if (textLower.match(/(makan|kopi|nasi|minum|restoran|warung|cafe|food|snack)/)) {
        matchedCategory = availableCategories.find((c) =>
          c.name.toLowerCase().includes("makan"),
        ) ?? null;
      } else if (textLower.match(/(ongkir|paket|drop|logistik|kurir|kirim|bensin|transport)/)) {
        matchedCategory = availableCategories.find((c) =>
          c.name.toLowerCase().match(/(logistik|transport|pengiriman)/),
        ) ?? null;
      } else if (textLower.match(/(domain|hosting|server|ai|it|komputer|laptop|software)/)) {
        matchedCategory = availableCategories.find((c) =>
          c.name.toLowerCase().match(/(it|operasional|teknologi)/),
        ) ?? null;
      }
    } else {
      if (textLower.includes("tiktok")) {
        matchedCategory = availableCategories.find((c) =>
          c.name.toLowerCase().includes("tiktok"),
        ) ?? null;
      } else if (textLower.includes("tokopedia")) {
        matchedCategory = availableCategories.find((c) =>
          c.name.toLowerCase().includes("tokopedia"),
        ) ?? null;
      }
    }
  }

  const finalCategory = matchedCategory ?? availableCategories[0] ?? categories[0];

  // 4. Parse Relative Date (fallback)
  let dateStr = defaultDateStr;
  const daysAgoMatch = textLower.match(/(\d+)\s*hari\s*(?:yang\s*)?lalu/);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1], 10);
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - days);
    dateStr = formatDateISO(targetDate);
  } else if (textLower.includes("kemarin lusa")) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - 2);
    dateStr = formatDateISO(targetDate);
  } else if (textLower.includes("kemarin")) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - 1);
    dateStr = formatDateISO(targetDate);
  } else if (textLower.includes("lusa")) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 2);
    dateStr = formatDateISO(targetDate);
  } else if (textLower.includes("besok")) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 1);
    dateStr = formatDateISO(targetDate);
  }

  // Capitalize first letter of prompt for clean description
  const description = text.charAt(0).toUpperCase() + text.slice(1);

  return {
    amount,
    type,
    description,
    categoryId: finalCategory?.id ?? "",
    confidence: matchedCategory ? 0.9 : 0.6,
    date: dateStr,
  };
}
