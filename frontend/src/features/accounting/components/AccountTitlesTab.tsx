"use client";

import React, { useState } from "react";
import { Search, BookOpen, Tag, CheckCircle, FolderTree } from "lucide-react";
import { AccountTitle, AccountCategory } from "@/features/accounting/types/accounting";

interface AccountTitlesTabProps {
  accountTitles: AccountTitle[];
}

export const AccountTitlesTab: React.FC<AccountTitlesTabProps> = ({ accountTitles }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");

  const categoryNames: Record<AccountCategory, { name: string; color: string }> = {
    [AccountCategory.Asset]: { name: "資產", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    [AccountCategory.Liability]: { name: "負債", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    [AccountCategory.Equity]: { name: "權益", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    [AccountCategory.Revenue]: { name: "收入", color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
    [AccountCategory.Expense]: { name: "費用", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" }
  };

  const filteredTitles = accountTitles.filter(t => {
    const matchesSearch = t.code.includes(searchTerm) || t.name.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      
      {/* Header & Search / Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-emerald-400" />
            <span>會計科目表 (Chart of Accounts)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">MS-SQL `account.AccountTitles` 資料表對應之會計科目</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter Pills */}
          <div className="flex bg-gray-100 dark:bg-slate-950 p-1 rounded-lg border border-gray-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-md transition ${selectedCategory === "all" ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm font-medium" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
            >
              全部 ({accountTitles.length})
            </button>
            {Object.entries(categoryNames).map(([catKey, catVal]) => {
              const catNum = Number(catKey);
              const count = accountTitles.filter(t => t.category === catNum).length;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catNum)}
                  className={`px-2.5 py-1 rounded-md transition ${selectedCategory === catNum ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm font-medium" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
                >
                  {catVal.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋代碼或科目名稱..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500/50 w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 font-semibold">科目代碼 (Code)</th>
              <th className="py-3 px-4 font-semibold">科目名稱 (Name)</th>
              <th className="py-3 px-4 font-semibold">科目類別 (Category)</th>
              <th className="py-3 px-4 font-semibold">層級 (Level)</th>
              <th className="py-3 px-4 font-semibold">狀態</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
            {filteredTitles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500 font-sans">
                  未找到符合條件的會計科目
                </td>
              </tr>
            ) : (
              filteredTitles.map(t => {
                const catInfo = categoryNames[t.category] || { name: "其他", color: "bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300" };
                return (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-blue-600 dark:text-emerald-400 font-bold">{t.code}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-white">{t.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-sans ${catInfo.color}`}>
                        <Tag className="h-3 w-3" />
                        {catInfo.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">Level {t.level}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px]">
                        <CheckCircle className="h-3 w-3" /> 啟用中
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
