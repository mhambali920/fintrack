import { getCategoriesByType } from "@/lib/finance";
import { TransactionForm } from "@/components/transaction-form";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage() {
  const initialCategories = await getCategoriesByType("expense");

  return (
    <section className="py-2 sm:py-4">
      <TransactionForm initialCategories={initialCategories} />
    </section>
  );
}
