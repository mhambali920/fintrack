import { PlusCircle, Trash2, Pencil } from "lucide-react";
import {
  createCategoryFormAction,
  deleteCategoryFormAction,
  updateCategoryFormAction,
} from "@/app/(dashboard)/actions";
import { getAllCategories, type CategoryRecord } from "@/lib/finance";

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

function inputClassName() {
  return "w-full rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-4 py-3 text-[var(--retro-text)] outline-none transition placeholder:text-[var(--retro-muted)] focus:border-[var(--retro-accent)]";
}

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
    <article className="rounded-[22px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-4 shadow-[5px_5px_0_var(--retro-shadow)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 rounded-full border-2 border-[var(--retro-border)]"
              style={{ backgroundColor: safeColor(category.color) }}
            />
            <h3 className="truncate text-lg font-bold text-[var(--retro-text)]">
              {category.name}
            </h3>
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--retro-muted)]">
            {category.type} {category.icon ? `· ${category.icon}` : ""}
          </p>
        </div>

        <div className="rounded-full border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-[var(--retro-accent)]">
          {category.type}
        </div>
      </div>

      <details className="relative z-10 mt-4">
        <summary className="cursor-pointer list-none rounded-[14px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel-strong)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--retro-text)]">
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
                <input
                  name="name"
                  defaultValue={category.name}
                  className={inputClassName()}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
                  Type
                </span>
                <select
                  name="type"
                  defaultValue={category.type}
                  className={inputClassName()}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
                  Icon name
                </span>
                <input
                  name="icon"
                  defaultValue={category.icon ?? ""}
                  placeholder="Wallet"
                  className={inputClassName()}
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

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-accent)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--retro-ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
            >
              <Pencil className="h-4 w-4" />
              Update
            </button>
          </form>

          <form action={deleteCategoryFormAction}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-[16px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--retro-text)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
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
      <div className="flex flex-col gap-4 rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 shadow-[10px_10px_0_var(--retro-shadow)] lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--retro-accent)]">
            Categories
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--retro-text)]">
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
        className="space-y-4 rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 shadow-[10px_10px_0_var(--retro-shadow)]"
      >
        <div className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-[var(--retro-accent)]" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--retro-accent)]">
            Add category
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Name
            </span>
            <input name="name" required className={inputClassName()} placeholder="Makanan" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Type
            </span>
            <select name="type" defaultValue="expense" className={inputClassName()}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[var(--retro-accent)]">
              Icon name
            </span>
            <input
              name="icon"
              placeholder="ShoppingCart"
              className={inputClassName()}
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

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-[18px] border-2 border-[var(--retro-border)] bg-[var(--retro-accent)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--retro-ink)] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_var(--retro-shadow)]"
        >
          <PlusCircle className="h-4 w-4" />
          Save category
        </button>
      </form>

      {(["income", "expense"] as const).map((type) => (
        <section
          key={type}
          className="space-y-4 rounded-[26px] border-2 border-[var(--retro-border)] bg-[var(--retro-panel)] p-5 shadow-[10px_10px_0_var(--retro-shadow)]"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--retro-accent)]">
              {type}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-[var(--retro-text)]">
              {sectionTitle(type)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--retro-muted)]">
              {sectionNote(type)}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {grouped[type].length > 0 ? (
              grouped[type].map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <div className="rounded-[22px] border-2 border-[var(--retro-border)] bg-[var(--retro-surface)] p-5 text-sm leading-6 text-[var(--retro-muted)]">
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
