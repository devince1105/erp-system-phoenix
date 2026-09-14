'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { inventoryApi } from '@/features/inventory/api/inventoryApi';
import { StockMatrixItem } from '@/features/inventory/types/inventory';
import { Boxes, Search, AlertTriangle, ShieldAlert, Check, Edit3, Filter } from 'lucide-react';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { Pagination } from '@/features/core/components/Pagination';

export default function StockLevelsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [keyword, setKeyword] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Inline 編輯安全庫存
  const [editingSafetyKey, setEditingSafetyKey] = useState<string | null>(null);
  const [safetyInput, setSafetyInput] = useState<number>(0);
  const [isUpdatingSafety, setIsUpdatingSafety] = useState(false);

  const queryKey = `/api/WarehouseStocks?kw=${keyword}&wh=${selectedWarehouseId || ''}&low=${lowStockOnly}`;
  const { data, isLoading } = useSWR(
    queryKey,
    () =>
      inventoryApi.getStockMatrix({
        keyword: keyword.trim() || undefined,
        warehouseId: selectedWarehouseId,
        lowStockOnly,
      }),
    { revalidateOnFocus: false }
  );

  const warehouses = data?.warehouses || [];
  const items: StockMatrixItem[] = data?.items || [];
  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleStartEditSafety = (warehouseId: number, productId: number, currentSafety: number) => {
    setEditingSafetyKey(`${warehouseId}-${productId}`);
    setSafetyInput(currentSafety);
  };

  const handleSaveSafety = async (warehouseId: number, productId: number) => {
    try {
      setIsUpdatingSafety(true);
      await inventoryApi.updateSafetyStock(warehouseId, productId, safetyInput);
      setEditingSafetyKey(null);
      mutate(queryKey);
    } catch (err) {
      console.error(err);
      alert('更新安全庫存失敗');
    } finally {
      setIsUpdatingSafety(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: '首頁', href: '/' },
          { label: '進銷存系統 (Inventory)', href: '/inventory' },
          { label: '庫存分佈看板' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-6 w-6 text-indigo-600" />
            各倉庫存分佈透視 (Stock Levels)
          </h1>
          <p className="text-sm text-slate-500 mt-1">跨倉庫即時庫存透視分佈矩陣，監控安全庫存水位與告警。</p>
        </div>
      </div>

      {/* 篩選工具列 */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* 搜尋 */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋商品名稱或 SKU..."
              value={keyword}
              onChange={e => {
                setKeyword(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* 倉庫篩選 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedWarehouseId ?? ''}
              onChange={e => {
                setSelectedWarehouseId(e.target.value ? Number(e.target.value) : undefined);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="">全部倉庫</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} {w.isDefault ? '(預設)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 安全庫存告警篩選切換 */}
          <button
            type="button"
            onClick={() => {
              setLowStockOnly(prev => !prev);
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              lowStockOnly
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${lowStockOnly ? 'text-amber-600' : 'text-slate-400'}`} />
            只看低於安全庫存
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          共篩選出 <span className="font-semibold text-slate-700">{items.length}</span> 項商品
        </div>
      </div>

      {/* 庫存透視矩陣表格 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            載入庫存透視資料中...
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            {lowStockOnly ? '目前所有商品庫存量皆高於安全庫存警戒值！' : '查無符合條件的商品庫存記錄。'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider min-w-[220px]">
                    商品資訊
                  </th>
                  <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right w-28">
                    全公司總存量
                  </th>
                  {warehouses.map(w => (
                    <th
                      key={w.id}
                      className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center min-w-[170px]"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{w.name}</span>
                        {w.isDefault && (
                          <span className="text-[10px] px-1 py-0.2 bg-blue-100 text-blue-700 rounded font-normal">
                            總倉
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">{w.code}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedItems.map(item => (
                  <tr key={item.productId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                          {item.productName}
                          {item.hasLowStockAlert && (
                            <span
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-normal"
                              title="有倉庫低於安全庫存警戒"
                            >
                              <ShieldAlert className="w-3 h-3 text-red-500" />
                              缺貨警戒
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">SKU: {item.productSku}</div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                        {item.productTotalStock.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">件</span>
                    </td>

                    {item.warehouses.map(wh => {
                      const editKey = `${wh.warehouseId}-${item.productId}`;
                      const isEditing = editingSafetyKey === editKey;

                      return (
                        <td key={wh.warehouseId} className="px-4 py-3 text-center">
                          <div
                            className={`p-2 rounded-lg border transition-colors ${
                              wh.isLowStock
                                ? 'bg-red-50/50 border-red-200 text-red-900'
                                : 'bg-slate-50/30 border-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">現存量</span>
                              <span
                                className={`font-mono text-sm font-bold ${
                                  wh.isLowStock ? 'text-red-600' : 'text-slate-800'
                                }`}
                              >
                                {wh.quantity.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60 text-xs">
                              <span className="text-slate-400 text-[11px]">安全警戒:</span>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    value={safetyInput}
                                    onChange={e => setSafetyInput(Number(e.target.value))}
                                    className="w-14 px-1 py-0.5 text-xs font-mono border border-indigo-300 rounded focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    disabled={isUpdatingSafety}
                                    onClick={() => handleSaveSafety(wh.warehouseId, item.productId)}
                                    className="p-0.5 text-emerald-600 hover:bg-emerald-50 rounded"
                                    title="儲存"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => handleStartEditSafety(wh.warehouseId, item.productId, wh.safetyStock)}
                                  className="group inline-flex items-center gap-1 cursor-pointer hover:text-indigo-600"
                                  title="點擊修改安全庫存"
                                >
                                  <span className="font-mono">{wh.safetyStock}</span>
                                  <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-indigo-500" />
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          totalItems={items.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={size => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
