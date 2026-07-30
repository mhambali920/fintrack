"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ActionResult = {
  ok: boolean;
  error?: string;
};

type EntityType = "income" | "expense";

function parseString(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parseNullableString(value: FormDataEntryValue | null | undefined) {
  const stringValue = parseString(value);
  return stringValue.length > 0 ? stringValue : null;
}

function parseEntityType(value: FormDataEntryValue | null | undefined) {
  const type = parseString(value);

  if (type === "income" || type === "expense") {
    return type;
  }

  return null;
}

function parseAmount(value: FormDataEntryValue | null | undefined) {
  const amount = Number.parseFloat(parseString(value).replace(/,/g, ""));

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}

function parseDate(value: FormDataEntryValue | null | undefined) {
  const date = parseString(value);

  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return date;
}

async function getAuthedSupabaseClient() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

function revalidateFinanceRoutes() {
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/categories");
}

function resolveFormData(
  first: ActionResult | FormData | undefined,
  second?: FormData,
) {
  if (second) {
    return second;
  }

  if (first instanceof FormData) {
    return first;
  }

  return null;
}

export async function createTransactionAction(
  previousStateOrFormData: ActionResult | FormData | undefined,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = resolveFormData(previousStateOrFormData, maybeFormData);

  if (!formData) {
    return { ok: false, error: "Invalid form submission." };
  }

  const { supabase, user } = await getAuthedSupabaseClient();

  if (!user) {
    return { ok: false, error: "Unauthorized." };
  }

  const type = parseEntityType(formData.get("type"));
  const amount = parseAmount(formData.get("amount"));
  const date = parseDate(formData.get("date"));

  if (!type || amount === null || !date) {
    return { ok: false, error: "Type, amount, and date are required." };
  }

  const categoryId = parseNullableString(formData.get("category_id"));
  const description = parseNullableString(formData.get("description"));

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    category_id: categoryId,
    type,
    amount,
    description,
    date,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinanceRoutes();
  return { ok: true };
}

export async function deleteTransactionFormAction(formData: FormData) {
  await deleteTransactionAction(formData);
}

export async function updateTransactionAction(
  previousStateOrFormData: ActionResult | FormData | undefined,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = resolveFormData(previousStateOrFormData, maybeFormData);

  if (!formData) {
    return { ok: false, error: "Invalid form submission." };
  }

  const { supabase, user } = await getAuthedSupabaseClient();

  if (!user) {
    return { ok: false, error: "Unauthorized." };
  }

  const transactionId = parseString(formData.get("id"));
  const type = parseEntityType(formData.get("type"));
  const amount = parseAmount(formData.get("amount"));
  const date = parseDate(formData.get("date"));

  if (!transactionId || !type || amount === null || !date) {
    return { ok: false, error: "Missing or invalid transaction data." };
  }

  const categoryId = parseNullableString(formData.get("category_id"));
  const description = parseNullableString(formData.get("description"));

  const { error } = await supabase
    .from("transactions")
    .update({
      category_id: categoryId,
      type,
      amount,
      description,
      date,
    })
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinanceRoutes();
  return { ok: true };
}

export async function deleteTransactionAction(
  previousStateOrFormData: ActionResult | FormData | undefined,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = resolveFormData(previousStateOrFormData, maybeFormData);

  if (!formData) {
    return { ok: false, error: "Invalid form submission." };
  }

  const { supabase, user } = await getAuthedSupabaseClient();

  if (!user) {
    return { ok: false, error: "Unauthorized." };
  }

  const transactionId = parseString(formData.get("id"));

  if (!transactionId) {
    return { ok: false, error: "Transaction id is required." };
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinanceRoutes();
  return { ok: true };
}

export async function createCategoryAction(
  previousStateOrFormData: ActionResult | FormData | undefined,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = resolveFormData(previousStateOrFormData, maybeFormData);

  if (!formData) {
    return { ok: false, error: "Invalid form submission." };
  }

  const { supabase, user } = await getAuthedSupabaseClient();

  if (!user) {
    return { ok: false, error: "Unauthorized." };
  }

  const name = parseString(formData.get("name"));
  const type = parseEntityType(formData.get("type"));

  if (!name || !type) {
    return { ok: false, error: "Name and type are required." };
  }

  const icon = parseNullableString(formData.get("icon"));
  const color = parseNullableString(formData.get("color"));

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name,
    type,
    icon,
    color,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinanceRoutes();
  return { ok: true };
}

export async function createCategoryFormAction(formData: FormData) {
  await createCategoryAction(formData);
}

export async function updateCategoryAction(
  previousStateOrFormData: ActionResult | FormData | undefined,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = resolveFormData(previousStateOrFormData, maybeFormData);

  if (!formData) {
    return { ok: false, error: "Invalid form submission." };
  }

  const { supabase, user } = await getAuthedSupabaseClient();

  if (!user) {
    return { ok: false, error: "Unauthorized." };
  }

  const categoryId = parseString(formData.get("id"));
  const name = parseString(formData.get("name"));
  const type = parseEntityType(formData.get("type"));

  if (!categoryId || !name || !type) {
    return { ok: false, error: "Missing or invalid category data." };
  }

  const icon = parseNullableString(formData.get("icon"));
  const color = parseNullableString(formData.get("color"));

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      type,
      icon,
      color,
    })
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinanceRoutes();
  return { ok: true };
}

export async function updateCategoryFormAction(formData: FormData) {
  await updateCategoryAction(formData);
}

export async function deleteCategoryAction(
  previousStateOrFormData: ActionResult | FormData | undefined,
  maybeFormData?: FormData,
): Promise<ActionResult> {
  const formData = resolveFormData(previousStateOrFormData, maybeFormData);

  if (!formData) {
    return { ok: false, error: "Invalid form submission." };
  }

  const { supabase, user } = await getAuthedSupabaseClient();

  if (!user) {
    return { ok: false, error: "Unauthorized." };
  }

  const categoryId = parseString(formData.get("id"));

  if (!categoryId) {
    return { ok: false, error: "Category id is required." };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidateFinanceRoutes();
  return { ok: true };
}

export async function deleteCategoryFormAction(formData: FormData) {
  await deleteCategoryAction(formData);
}
