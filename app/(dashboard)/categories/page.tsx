import { Plus, Trash2, Pencil, Tags, ArrowUpRight, ArrowDownLeft } from "lucide-react";
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
  { label: "Pemasukan (Income)", value: "income" },
  { label: "Pengeluaran (Expense)", value: "expense" },
] as const;

function sectionTitle(type: "income" | "expense") {
  return type === "income" ? "Kategori Pemasukan" : "Kategori Pengeluaran";
}

function sectionNote(type: "income" | "expense") {
  return type === "income"
    ? "Kategori untuk mengelompokkan sumber pemasukan seperti gaji, bisnis, investasi, atau bonus."
    : "Kategori untuk mengelompokkan pengeluaran seperti makanan, belanjawan, tagihan, dan hiburan.";
}

function safeColor(color: string | null) {
  return color && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
    ? color
    : "#6366f1";
}

function CategoryCard({ category }: { category: CategoryRecord }) {
  const color = safeColor(category.color);
  const isIncome = category.type === "income";

  return (
    <article className="group relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-inner"
            style={{
              backgroundColor: `${color}18`,
              color: color,
              borderColor: `${color}30`,
            }}
          >
            {category.icon ? (
              <span className="text-xs font-bold uppercase">{category.icon.slice(0, 2)}</span>
            ) : isIncome ? (
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            ) : (
              <ArrowDownLeft className="h-5 w-5 text-rose-500" />
            )}
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-base font-bold text-[var(--foreground)]">
              {category.name}
            </h4>
            <p className="text-[11px] text-muted">
              {category.icon ? `Icon: ${category.icon}` : "Standard icon"}
            </p>
          </div>
        </div>

        <span
          className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            borderColor: `${color}30`,
          }}
        >
          {category.type}
        </span>
      </div>

      {/* Edit Accordion */}
      <details className="mt-4 pt-3 border-t border-[var(--border)] group/details">
        <summary className="cursor-pointer list-none flex items-center justify-between text-xs font-semibold text-muted hover:text-[var(--foreground)] transition-colors">
          <span className="inline-flex items-center gap-1.5">
            <Pencil className="h-3.5 w-3.5 text-indigo-500" />
            Edit Kategori
          </span>
          <span className="text-[10px] bg-[var(--surface-hover)] px-2 py-0.5 rounded-md">Atur</span>
        </summary>

        <div className="mt-4 space-y-4 pt-2">
          <form action={updateCategoryFormAction} className="space-y-3">
            <input type="hidden" name="id" value={category.id} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="block text-xs font-medium text-muted">Nama</span>
                <UiInput name="name" defaultValue={category.name} className="w-full" />
              </label>

              <UiSelect
                name="type"
                label="Tipe"
                defaultValue={category.type}
                items={[...typeItems]}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="block text-xs font-medium text-muted">Icon Name</span>
                <UiInput
                  name="icon"
                  defaultValue={category.icon ?? ""}
                  placeholder="Wallet"
                  className="w-full"
                />
              </label>

              <label className="block space-y-1">
                <span className="block text-xs font-medium text-muted">Warna Label</span>
                <input
                  name="color"
                  defaultValue={category.color ?? "#6366f1"}
                  type="color"
                  className="h-[42px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 cursor-pointer"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-1">
              <UiButton type="submit" variant="primary" size="sm" className="flex-1 justify-center">
                <Pencil className="h-3.5 w-3.5" />
                <span>Simpan</span>
              </UiButton>
            </div>
          </form>

          <form action={deleteCategoryFormAction}>
            <input type="hidden" name="id" value={category.id} />
            <UiButton
              type="submit"
              variant="outline"
              size="sm"
              className="w-full justify-center text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 border-rose-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus Kategori</span>
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
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-wider">
            <Tags className="h-4 w-4" />
            <span>Category Manager</span>
          </div>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Kategori Keuangan
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Kelola kategori pribadi untuk mempermudah analisis transaksi.
          </p>
        </div>
      </div>

      {/* Add Category Form */}
      <form
        action={createCategoryFormAction}
        className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)] border-b border-[var(--border)] pb-3">
          <Plus className="h-4 w-4 text-indigo-500" />
          <span>Tambah Kategori Baru</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="block text-xs font-semibold text-muted">
              Nama Kategori <span className="text-rose-500">*</span>
            </span>
            <UiInput name="name" required className="w-full" placeholder="Contoh: Makanan & Minuman" />
          </label>

          <UiSelect
            name="type"
            label="Tipe Kategori"
            defaultValue="expense"
            items={[...typeItems]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="block text-xs font-semibold text-muted">
              Nama Icon (Opsional)
            </span>
            <UiInput
              name="icon"
              placeholder="ShoppingCart, Utensils, Wallet, dll"
              className="w-full"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="block text-xs font-semibold text-muted">
              Pilih Warna Badge
            </span>
            <input
              name="color"
              type="color"
              defaultValue="#6366f1"
              className="h-[42px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 cursor-pointer"
            />
          </label>
        </div>

        <UiButton
          type="submit"
          variant="primary"
          className="w-full sm:w-auto px-6 justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>Simpan Kategori</span>
        </UiButton>
      </form>

      {/* Grouped Category Sections */}
      {(["income", "expense"] as const).map((type) => (
        <section
          key={type}
          className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm space-y-4"
        >
          <div className="border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              {type === "income" ? (
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              ) : (
                <ArrowDownLeft className="h-5 w-5 text-rose-500" />
              )}
              <h3 className="text-lg font-bold tracking-tight text-[var(--foreground)] sm:text-xl">
                {sectionTitle(type)}
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted">
              {sectionNote(type)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-1">
            {grouped[type].length > 0 ? (
              grouped[type].map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-xs text-muted">
                Belum ada kategori {type}. Tambahkan kategori pertama menggunakan form di atas.
              </div>
            )}
          </div>
        </section>
      ))}
    </section>
  );
}
