import React from "react";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;

  const generatePagination = (currentPage: number, totalPages: number) => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  if (totalItems === 0) return null;

  return (
    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
      
      {/* 1. Left: Page Info */}
      <div className="hidden sm:flex items-center justify-start order-3 sm:order-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          第 {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} 筆，共 {totalItems} 筆
        </span>
      </div>

      {/* 2. Center: Pagination Controls */}
      <div className="flex items-center justify-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-slate-300 dark:border-slate-800 rounded-sm bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs whitespace-nowrap"
        >
          上一頁
        </button>
        <div className="flex items-center gap-1 hidden sm:flex">
          {generatePagination(currentPage, totalPages).map((item, idx) =>
            item === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="w-7 h-7 flex items-center justify-center text-slate-500 text-xs"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item as number)}
                className={`w-7 h-7 flex items-center justify-center border rounded-sm transition-colors text-xs font-medium ${
                  currentPage === item
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400"
                    : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-slate-300 dark:border-slate-800 rounded-sm bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs whitespace-nowrap"
        >
          下一頁
        </button>
      </div>

      {/* 3. Right: Page Size */}
      <div className="flex items-center justify-center sm:justify-end gap-2 order-2 sm:order-3">
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="px-2 py-1 border border-slate-300 dark:border-slate-800 rounded-sm bg-white dark:bg-slate-900 text-xs focus:outline-none focus:border-blue-500"
        >
          <option value={5}>5 筆/頁</option>
          <option value={10}>10 筆/頁</option>
          <option value={20}>20 筆/頁</option>
        </select>
      </div>

    </div>
  );
};
