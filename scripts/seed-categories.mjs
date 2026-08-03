import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const defaultCategories = [
  // Income
  { name: "Salary", type: "income", icon: "BriefcaseBusiness", color: "#ffb84d" },
  { name: "Bonus", type: "income", icon: "Sparkles", color: "#f97316" },
  { name: "Freelance", type: "income", icon: "Laptop", color: "#fb7185" },
  { name: "Business", type: "income", icon: "Store", color: "#22c55e" },
  { name: "Investment", type: "income", icon: "TrendingUp", color: "#60a5fa" },
  { name: "Dividend", type: "income", icon: "PiggyBank", color: "#a78bfa" },
  { name: "Interest", type: "income", icon: "Banknote", color: "#14b8a6" },
  { name: "Cashback", type: "income", icon: "BadgePercent", color: "#eab308" },
  { name: "Gift", type: "income", icon: "Gift", color: "#f43f5e" },
  { name: "Refund", type: "income", icon: "RotateCcw", color: "#94a3b8" },
  { name: "Side Hustle", type: "income", icon: "BadgeDollarSign", color: "#84cc16" },
  { name: "Other Income", type: "income", icon: "CirclePlus", color: "#c084fc" },

  // Expense
  { name: "Food", type: "expense", icon: "UtensilsCrossed", color: "#ef4444" },
  { name: "Groceries", type: "expense", icon: "ShoppingCart", color: "#f59e0b" },
  { name: "Coffee", type: "expense", icon: "Coffee", color: "#a16207" },
  { name: "Transport", type: "expense", icon: "BusFront", color: "#38bdf8" },
  { name: "Fuel", type: "expense", icon: "Fuel", color: "#fb923c" },
  { name: "Rent", type: "expense", icon: "Home", color: "#8b5cf6" },
  { name: "Utilities", type: "expense", icon: "PlugZap", color: "#facc15" },
  { name: "Internet", type: "expense", icon: "Wifi", color: "#06b6d4" },
  { name: "Phone", type: "expense", icon: "Smartphone", color: "#22c55e" },
  { name: "Insurance", type: "expense", icon: "ShieldCheck", color: "#64748b" },
  { name: "Health", type: "expense", icon: "HeartPulse", color: "#f43f5e" },
  { name: "Pharmacy", type: "expense", icon: "Pill", color: "#ec4899" },
  { name: "Education", type: "expense", icon: "GraduationCap", color: "#3b82f6" },
  { name: "Entertainment", type: "expense", icon: "Film", color: "#c084fc" },
  { name: "Subscription", type: "expense", icon: "CreditCard", color: "#ef4444" },
  { name: "Shopping", type: "expense", icon: "ShoppingBag", color: "#f97316" },
  { name: "Travel", type: "expense", icon: "Plane", color: "#0ea5e9" },
  { name: "Family", type: "expense", icon: "Users", color: "#84cc16" },
  { name: "Kids", type: "expense", icon: "Baby", color: "#e879f9" },
  { name: "Pet", type: "expense", icon: "PawPrint", color: "#f59e0b" },
  { name: "Charity", type: "expense", icon: "HeartHandshake", color: "#fb7185" },
  { name: "Taxes", type: "expense", icon: "ReceiptText", color: "#94a3b8" },
  { name: "Debt", type: "expense", icon: "Landmark", color: "#f43f5e" },
  { name: "Maintenance", type: "expense", icon: "Wrench", color: "#64748b" },
  { name: "Beauty", type: "expense", icon: "Scissors", color: "#f472b6" },
  { name: "Office", type: "expense", icon: "BriefcaseBusiness", color: "#14b8a6" },
  { name: "Supplies", type: "expense", icon: "Package", color: "#d97706" },
  { name: "Bank Fees", type: "expense", icon: "BadgeMinus", color: "#dc2626" },
  { name: "Other Expense", type: "expense", icon: "CircleSlash2", color: "#a855f7" },
];

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function main() {
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = requiredEnv("SEED_USER_ID");

  if (!secretKey) {
    throw new Error("Missing environment variable: SUPABASE_SECRET_KEY");
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(`Failed to clear existing categories: ${deleteError.message}`);
  }

  const rows = defaultCategories.map((category) => ({
    user_id: userId,
    ...category,
  }));

  const { error: insertError } = await supabase.from("categories").insert(rows);

  if (insertError) {
    throw new Error(`Failed to insert seed categories: ${insertError.message}`);
  }

  console.log(
    `Seeded ${rows.length} categories for user ${userId}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
