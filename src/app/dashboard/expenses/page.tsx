import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { prisma } from "@/lib/prisma";
import { createExpense } from "../erp/actions";
import { ExpenseCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("en-ET", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const categoryColors: Record<ExpenseCategory, string> = {
  RENT: "bg-purple-100 text-purple-700 border-purple-200",
  UTILITIES: "bg-blue-100 text-blue-700 border-blue-200",
  PAYROLL: "bg-orange-100 text-orange-700 border-orange-200",
  SUPPLIES: "bg-teal-100 text-teal-700 border-teal-200",
  REPAIRS: "bg-yellow-100 text-yellow-700 border-yellow-200",
  MARKETING: "bg-pink-100 text-pink-700 border-pink-200",
  OTHER: "bg-stone-100 text-stone-700 border-stone-200",
};

const categoryIcons: Record<ExpenseCategory, string> = {
  RENT: "🏠",
  UTILITIES: "⚡",
  PAYROLL: "👥",
  SUPPLIES: "🛍️",
  REPAIRS: "🔧",
  MARKETING: "📢",
  OTHER: "💼",
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function ExpensesPage() {
  const { restaurant } = await getRestaurantContext();
  const rid = restaurant.id;
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [expenses, monthTotal] = await Promise.all([
    prisma.expense.findMany({
      where: { restaurantId: rid },
      orderBy: { date: "desc" },
    }),
    prisma.expense.aggregate({
      where: { restaurantId: rid, date: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ]);

  // Group by category
  const byCategory: Record<string, number> = {};
  for (const e of expenses.filter((e) => new Date(e.date) >= monthStart)) {
    byCategory[e.category] = (byCategory[e.category] ?? 0) + Number(e.amount);
  }

  const thisMonth = Number(monthTotal._sum.amount ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Expenses</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {expenses.length} records · This month: ETB {fmt(thisMonth)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add Expense Form */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sticky top-24">
            <h2 className="font-semibold text-stone-800 mb-4">Add Expense</h2>
            <form action={createExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                <select
                  name="category"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {Object.values(ExpenseCategory).map((c) => (
                    <option key={c} value={c}>
                      {categoryIcons[c]} {c.charAt(0) + c.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Description *</label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="e.g. Monthly Rent - Main Hall"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Amount (ETB) *</label>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={now.toISOString().slice(0, 10)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Additional notes"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>

        {/* Right: Summary + List */}
        <div className="lg:col-span-2 space-y-5">
          {/* Category Summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(byCategory).map(([cat, total]) => (
              <div key={cat} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                <div className="mb-2 text-2xl">{categoryIcons[cat as ExpenseCategory]}</div>
                <p className="text-xs text-stone-500">{cat.charAt(0) + cat.slice(1).toLowerCase()}</p>
                <p className="text-base font-bold text-stone-900">ETB {fmt(total)}</p>
              </div>
            ))}
            {Object.keys(byCategory).length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-stone-300 p-8 text-center">
                <p className="text-stone-400 text-sm">No expenses this month</p>
              </div>
            )}
          </div>

          {/* Expense List */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800">All Expenses</h2>
              <span className="text-sm font-bold text-stone-900">Total: ETB {fmt(expenses.reduce((s, e) => s + Number(e.amount), 0))}</span>
            </div>
            {expenses.length === 0 ? (
              <div className="py-20 text-center">
                <span className="text-5xl">💸</span>
                <p className="mt-3 font-medium text-stone-500">No expenses yet</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50/70 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl">
                      {categoryIcons[exp.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">{exp.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${categoryColors[exp.category]}`}>
                          {exp.category}
                        </span>
                        <span className="text-xs text-stone-400">{new Date(exp.date).toLocaleDateString("en-ET")}</span>
                        {exp.notes && <span className="text-xs text-stone-400 truncate">{exp.notes}</span>}
                      </div>
                    </div>
                    <p className="text-base font-bold text-stone-900 shrink-0">ETB {fmt(Number(exp.amount))}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

