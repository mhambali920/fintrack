import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EntityType = "income" | "expense";

export type CategoryRecord = {
  id: string;
  name: string;
  type: EntityType;
  icon: string | null;
  color: string | null;
};

export type TransactionRecord = {
  id: string;
  type: EntityType;
  amount: number;
  description: string | null;
  date: string;
  category: {
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
};

export type DashboardOverview = {
  totalBalance: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  recentTransactions: TransactionRecord[];
};

export type TransactionListFilters = {
  month: string;
  type: EntityType | "all";
  page: number;
  pageSize: number;
};

export type TransactionListResult = {
  items: TransactionRecord[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
  filters: TransactionListFilters;
};

function getMonthRange(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function toNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = getMonthRange();

  const [{ data: transactions, error: transactionError }, { data: monthTransactions, error: monthError }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("id, type, amount, description, date, category:categories(name, icon, color)")
        .order("date", { ascending: false }),
      supabase
        .from("transactions")
        .select("type, amount, date")
        .gte("date", start)
        .lt("date", end),
    ]);

  if (transactionError) {
    throw new Error(transactionError.message);
  }

  if (monthError) {
    throw new Error(monthError.message);
  }

  const normalizedTransactions: TransactionRecord[] = (transactions ?? []).map((transaction) => {
    const categoryData = transaction.category as
      | { name?: string | null; icon?: string | null; color?: string | null }
      | { name?: string | null; icon?: string | null; color?: string | null }[]
      | null
      | undefined;

    const category = Array.isArray(categoryData)
      ? categoryData[0] ?? null
      : categoryData ?? null;

    return {
      id: transaction.id as string,
      type: transaction.type as EntityType,
      amount: toNumber(transaction.amount),
      description: (transaction.description as string | null) ?? null,
      date: transaction.date as string,
      category: category
        ? {
            name: category.name ?? "Uncategorized",
            icon: category.icon ?? null,
            color: category.color ?? null,
          }
        : null,
    };
  });

  const totalBalance = normalizedTransactions.reduce((sum, transaction) => {
    return transaction.type === "income"
      ? sum + transaction.amount
      : sum - transaction.amount;
  }, 0);

  const monthTotals = (monthTransactions ?? []).reduce(
    (acc, transaction) => {
      const amount = toNumber(transaction.amount);
      if (transaction.type === "income") {
        acc.income += amount;
      } else {
        acc.expense += amount;
      }
      return acc;
    },
    { income: 0, expense: 0 },
  );

  return {
    totalBalance,
    incomeThisMonth: monthTotals.income,
    expenseThisMonth: monthTotals.expense,
    recentTransactions: normalizedTransactions.slice(0, 5),
  };
}

export async function getCategoriesByType(type: EntityType) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, icon, color")
    .eq("type", type)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CategoryRecord[];
}

export async function getAllCategories() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, type, icon, color")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CategoryRecord[];
}

function getMonthBounds(month: string) {
  const [yearPart, monthPart] = month.split("-");
  const year = Number.parseInt(yearPart ?? "", 10);
  const monthIndex = Number.parseInt(monthPart ?? "", 10);

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    const fallback = new Date();
    const start = new Date(fallback.getFullYear(), fallback.getMonth(), 1);
    const end = new Date(fallback.getFullYear(), fallback.getMonth() + 1, 1);

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }

  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 1);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function getTransactionsPage({
  month,
  type,
  page,
  pageSize,
}: TransactionListFilters): Promise<TransactionListResult> {
  const supabase = await createSupabaseServerClient();
  const { start, end } = getMonthBounds(month);
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10;
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = supabase
    .from("transactions")
    .select("id, type, amount, description, date, category:categories(name, icon, color)", {
      count: "exact",
    })
    .gte("date", start)
    .lt("date", end)
    .order("date", { ascending: false })
    .range(from, to);

  if (type !== "all") {
    query = query.eq("type", type);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const items: TransactionRecord[] = (data ?? []).map((transaction) => {
    const categoryData = transaction.category as
      | { name?: string | null; icon?: string | null; color?: string | null }
      | { name?: string | null; icon?: string | null; color?: string | null }[]
      | null
      | undefined;

    const category = Array.isArray(categoryData)
      ? categoryData[0] ?? null
      : categoryData ?? null;

    return {
      id: transaction.id as string,
      type: transaction.type as EntityType,
      amount: toNumber(transaction.amount),
      description: (transaction.description as string | null) ?? null,
      date: transaction.date as string,
      category: category
        ? {
            name: category.name ?? "Uncategorized",
            icon: category.icon ?? null,
            color: category.color ?? null,
          }
        : null,
    };
  });

  const totalCount = count ?? items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));

  return {
    items,
    totalCount,
    totalPages,
    page: safePage,
    pageSize: safePageSize,
    filters: {
      month,
      type,
      page: safePage,
      pageSize: safePageSize,
    },
  };
}
