import { prisma } from "@/lib/prisma";
import { getRestaurantContext } from "@/lib/auth/require-restaurant-access";
import { createExpense } from "../erp/actions";
import { ExpenseCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

const categoryIcons: Record<ExpenseCategory, string> = {
  RENT: "🏠",
  UTILITIES: "⚡",
  PAYROLL: "👥",
  SUPPLIES: "🛍️",
  REPAIRS: "🔧",
  MARKETING: "📣",
  OTHER: "📦",
};

const categoryColors: Record<ExpenseCategory, string> = {
  RENT: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  UTILITIES: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PAYROLL: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SUPPLIES: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REPAIRS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  MARKETING: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  OTHER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default async function ExpensesPage() {
  const { restaurant } = await getRestaurantContext();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [expenses, monthlyExpenses] = await Promise.all([
    prisma.expense.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { date: "desc" },
      take: 50,
    }),
    prisma.expense.findMany({
      where: {
        restaurantId: restaurant.id,
        date: { gte: startOfMonth },
      },
    }),
  ]);

  const thisMonth = monthlyExpenses.reduce((s, e) => s + Number(e.amount), 0);

  const byCategory = monthlyExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Operating Expenses</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {expenses.length} records · This month: {restaurant.currency} {fmt(thisMonth)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add Expense Form */}
        <div className="lg:col-span-1">
          <div className="rounded-3xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-6 shadow-sm sticky top-24 space-y-4">
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Add Expense</h2>
            <form action={createExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  name="category"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#25324d] bg-white dark:bg-[#101624] px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {Object.values(ExpenseCategory).map((c) => (
                    <option key={c} value={c} className="dark:bg-[#151c2c]">
                      {categoryIcons[c]} {c.charAt(0) + c.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="e.g. Monthly Rent - Main Hall"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#25324d] bg-white dark:bg-[#101624] px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount ({restaurant.currency}) *</label>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#25324d] bg-white dark:bg-[#101624] px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={now.toISOString().slice(0, 10)}
                  className="w-full rounded-xl border border-slate-200 dark:border-[#25324d] bg-white dark:bg-[#101624] px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="Additional notes"
                  className="w-full rounded-xl border border-slate-200 dark:border-[#25324d] bg-white dark:bg-[#101624] px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 text-xs sm:text-sm shadow-md shadow-amber-500/20 transition cursor-pointer"
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
              <div
                key={cat}
                className="rounded-2xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-4 shadow-sm"
              >
                <div className="mb-2 text-2xl">{categoryIcons[cat as ExpenseCategory]}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{cat.charAt(0) + cat.slice(1).toLowerCase()}</p>
                <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {restaurant.currency} {fmt(total)}
                </p>
              </div>
            ))}
            {Object.keys(byCategory).length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 dark:border-[#222d42] bg-white dark:bg-[#151c2c] p-8 text-center">
                <p className="text-slate-400 text-sm">No expenses this month</p>
              </div>
            )}
          </div>

          {/* Expense List */}
          <div className="rounded-3xl border border-slate-200 dark:border-[#222d42] bg-white dark:bg-[#151c2c] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-[#1e2638] flex items-center justify-between">
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">All Expenses</h2>
              <span className="text-xs sm:text-sm font-black text-amber-500">
                Total: {restaurant.currency} {fmt(expenses.reduce((s, e) => s + Number(e.amount), 0))}
              </span>
            </div>
            {expenses.length === 0 ? (
              <div className="py-20 text-center">
                <span className="text-5xl">💸</span>
                <p className="mt-3 font-bold text-slate-500 dark:text-slate-400">No expenses yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-[#1e2638]">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/70 dark:hover:bg-[#1c253b]/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#1c253b] text-xl border border-slate-200 dark:border-[#25324d]">
                      {categoryIcons[exp.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{exp.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${categoryColors[exp.category]}`}>
                          {exp.category}
                        </span>
                        <span className="text-xs text-slate-400">{new Date(exp.date).toLocaleDateString("en-ET")}</span>
                        {exp.notes && <span className="text-xs text-slate-400 truncate">({exp.notes})</span>}
                      </div>
                    </div>
                    <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white shrink-0">
                      {restaurant.currency} {fmt(Number(exp.amount))}
                    </p>
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
