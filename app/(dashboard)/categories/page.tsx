import { PlusCircle, Trash2, Pencil } from "lucide-react";
import {
  createCategoryFormAction,
  deleteCategoryFormAction,
  updateCategoryFormAction,
} from "@/app/(dashboard)/actions";
import { getAllCategories, type CategoryRecord } from "@/lib/finance";
import { UiButton } from "@/components/ui/button";
import { UiInput } from "@/components/ui/input";
import { UiSelect } from "@/components/ui/select";

export const dynamic = "force-dynamic";

function groupCategories(categories: CategoryRecord[]) {
  return categories.reduce(
    (acc, category) => {
      acc[category.type].push(category);
      return acc;
    },
    {
      income: [] as CategoryRecord[],
      expense: [] as CategoryRecord[],
    },
  );
}

const typeItems = [
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
] as const;

function sectionTitle(type: "income" | "expense") {
  return type === "income" ? "Income categories" : "Expense categories";
}

function sectionNote(type: "income" | "expense") {
  return type === "income"
    ? "Kategori untuk pemasukan seperti gaji, bonus, atau transfer masuk."
    : "Kategori untuk pengeluaran seperti makanan, transport, dan tagihan.";
}

function safeColor(color: string | null) {
  return color && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
    ? color
    : "var(--retro-accent)";
}

function CategoryCard({ category }: { category: CategoryRecord }) {
  return (
    <article className="rounded-[20px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-3.5 shadow-[5px_5px_0_var(--retro-shadow)] sm:rounded-[22px] sm:p-4">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span
              className="h-3.5 w-3.5 rounded-full border-2 border-[var(--retro-border)] sm:h-4 sm:w-4"
              style={{ backgroundColor: safeColor(category.color) }}
            />
            <h3 className="truncate text-base font-bold text-[var(--retro-text)] sm:text-lg">
              {category.name}
            </h3>
          </div>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--retro-muted)] sm:mt-2 sm:text-xs sm:tracking-[0.18em]">
            {category.type} {category.icon ? `· ${category.icon}` : ""}
          </p>
        </div>

        <div className="rounded-full border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--retro-accent)] sm:px-3 sm:text-xs sm:tracking-[0.15em]">
          {category.type}
        </div>
      </div>

      <details className="relative z-10 mt-3.5 sm:mt-4">
        <summary className="cursor-pointer list-none rounded-[12px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-3.5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--retro-text)] sm:rounded-[14px] sm:px-4 sm:py-3 sm:text-sm sm:tracking-[0.14em]">
          <span className="inline-flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit category
          </span>
        </summary>

        <div className="mt-4 space-y-3">
          <form action={updateCategoryFormAction} className="space-y-3">
            <input type="hidden" name="id" value={category.id} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
                  Name
                </span>
                <UiInput name="name" defaultValue={category.name} className="w-full" />
              </label>

              <UiSelect
                name="type"
                label="Type"
                defaultValue={category.type}
                items={[...typeItems]}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
                  Icon name
                </span>
                <UiInput
                  name="icon"
                  defaultValue={category.icon ?? ""}
                  placeholder="Wallet"
                  className="w-full"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
                  Color
                </span>
                <input
                  name="color"
                  defaultValue={category.color ?? "#ffb84d"}
                  type="color"
                  className="h-[54px] w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-2 py-2"
                />
              </label>
            </div>

            <UiButton
              type="submit"
              variant="primary"
            >
              <Pencil className="h-4 w-4" />
              Update
            </UiButton>
          </form>

          <form action={deleteCategoryFormAction}>
            <input type="hidden" name="id" value={category.id} />
            <UiButton
              type="submit"
              variant="secondary"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </UiButton>
          </form>
        </div>
      </details>
    </article>
  );
}

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  const grouped = groupCategories(categories);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[24px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-4 shadow-[10px_10px_0_var(--retro-shadow)] sm:gap-4 sm:rounded-[26px] sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--retro-accent)] sm:text-sm sm:tracking-[0.3em]">
            Categories
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--retro-text)] sm:text-3xl">
            Kategori pribadi
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--retro-muted)]">
            Tambahkan, edit, dan hapus kategori milikmu sendiri. Semua data ini
            dipisahkan per user lewat RLS.
          </p>
        </div>
      </div>

      <form
        action={createCategoryFormAction}
        className="space-y-4 rounded-[24px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-4 shadow-[10px_10px_0_var(--retro-shadow)] sm:rounded-[26px] sm:p-5"
      >
        <div className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-[var(--retro-accent)]" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--retro-accent)] sm:text-sm sm:tracking-[0.3em]">
            Add category
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Name
            </span>
            <UiInput name="name" required className="w-full" placeholder="Makanan" />
          </label>

          <UiSelect
            name="type"
            label="Type"
            defaultValue="expense"
            items={[...typeItems]}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Icon name
            </span>
            <UiInput
              name="icon"
              placeholder="ShoppingCart"
              className="w-full"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Color
            </span>
            <input
              name="color"
              type="color"
              defaultValue="#ffb84d"
              className="h-[54px] w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-2 py-2"
            />
          </label>
        </div>

        <UiButton
          type="submit"
          variant="primary"
        >
          <PlusCircle className="h-4 w-4" />
          Save category
        </UiButton>
      </form>

      {(["income", "expense"] as const).map((type) => (
        <section
          key={type}
          className="space-y-4 rounded-[24px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-4 shadow-[10px_10px_0_var(--retro-shadow)] sm:rounded-[26px] sm:p-5"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--retro-accent)] sm:text-sm sm:tracking-[0.3em]">
              {type}
            </p>
            <h3 className="mt-2 text-xl font-bold text-[var(--retro-text)] sm:text-2xl">
              {sectionTitle(type)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--retro-muted)]">
              {sectionNote(type)}
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {grouped[type].length > 0 ? (
              grouped[type].map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <div className="rounded-[20px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-4 text-sm leading-6 text-[var(--retro-muted)] sm:rounded-[22px] sm:p-5">
                Belum ada kategori {type}. Tambahkan kategori pertama dari form di
                atas.
              </div>
            )}
          </div>
        </section>
      ))}
    </section>
  );
}
