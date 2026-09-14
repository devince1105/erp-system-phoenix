'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
  accountingApi,
  CustomReportTemplate,
  SaveCustomReportTemplatePayload,
} from '@/features/accounting/api/accountingApi';
import { useAuth } from '@/features/core/contexts/AuthContext';
import { Breadcrumbs } from '@/features/core/components/Breadcrumbs';
import { CustomReportTemplateModal } from '@/features/accounting/components/CustomReportTemplateModal';
import {
  FileSpreadsheet,
  Download,
  Printer,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Plus,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function CustomReportsPage() {
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];
  const isAuthorized = userRoles.includes('Admin') || userRoles.includes('Accountant');

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  // 日期設定
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // 比較期間設定
  const [enableCompare, setEnableCompare] = useState(false);
  const [compareStartDate, setCompareStartDate] = useState('');
  const [compareEndDate, setCompareEndDate] = useState('');

  // 折疊狀態控制 (SectionId -> boolean)
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  // 範本編輯 Modal
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomReportTemplate | undefined>(undefined);

  // 1. 載入所有範本
  const { data: templates = [] } = useSWR(
    isAuthorized ? '/api/CustomReports/templates' : null,
    () => accountingApi.getCustomReportTemplates(true),
    {
      revalidateOnFocus: false,
    }
  );

  const activeTemplateId = selectedTemplateId || (templates.length > 0 ? templates[0].id : null);

  // 2. 執行報表運算
  const reportQueryKey = activeTemplateId
    ? `/api/CustomReports/${activeTemplateId}/run?s=${startDate}&e=${endDate}&cs=${enableCompare ? compareStartDate : ''}&ce=${enableCompare ? compareEndDate : ''}`
    : null;

  const {
    data: reportResult,
    isLoading,
    error,
  } = useSWR(
    reportQueryKey,
    () =>
      activeTemplateId
        ? accountingApi.runCustomReport({
            templateId: activeTemplateId,
            startDate,
            endDate,
            compareStartDate: enableCompare ? compareStartDate : undefined,
            compareEndDate: enableCompare ? compareEndDate : undefined,
          })
        : null,
    { revalidateOnFocus: false }
  );

  const errorMsg = error ? (error instanceof Error ? error.message : '報表運算發生錯誤') : '';

  // 快速日期區間切換
  const handlePresetDate = (type: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear') => {
    const now = new Date();
    let s = new Date();
    let e = new Date();

    if (type === 'thisMonth') {
      s = new Date(now.getFullYear(), now.getMonth(), 1);
      e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (type === 'lastMonth') {
      s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      e = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (type === 'thisQuarter') {
      const q = Math.floor(now.getMonth() / 3);
      s = new Date(now.getFullYear(), q * 3, 1);
      e = new Date(now.getFullYear(), (q + 1) * 3, 0);
    } else if (type === 'thisYear') {
      s = new Date(now.getFullYear(), 0, 1);
      e = new Date(now.getFullYear(), 11, 31);
    }

    const sStr = s.toISOString().split('T')[0];
    const eStr = e.toISOString().split('T')[0];
    setStartDate(sStr);
    setEndDate(eStr);

    // 若有啟用比較期間，自動設定為上一期
    if (enableCompare) {
      const diffMs = e.getTime() - s.getTime();
      const compE = new Date(s.getTime() - 86400000);
      const compS = new Date(compE.getTime() - diffMs);
      setCompareStartDate(compS.toISOString().split('T')[0]);
      setCompareEndDate(compE.toISOString().split('T')[0]);
    }
  };

  const toggleSection = (id: number) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 格式化會計金額
  const formatMoney = (val?: number | null) => {
    if (val === undefined || val === null) return '-';
    if (val < 0) {
      return `(NT$ ${Math.abs(val).toLocaleString()})`;
    }
    return `NT$ ${val.toLocaleString()}`;
  };

  // 匯出 Excel
  const handleExportExcel = () => {
    if (!reportResult) return;

    const rows: (string | number)[][] = [
      ['報表名稱', reportResult.templateName],
      ['期間', `${reportResult.startDate} ~ ${reportResult.endDate}`],
      ...(reportResult.hasComparison
        ? [['比較期間', `${reportResult.compareStartDate} ~ ${reportResult.compareEndDate}`]]
        : []),
      [''],
      reportResult.hasComparison
        ? ['項目 / 科目', '本期金額', '比較期金額', '增減金額', '變動率(%)']
        : ['項目 / 科目', '金額'],
    ];

    for (const sec of reportResult.sections) {
      if (sec.isSubtotal) {
        rows.push(
          reportResult.hasComparison
            ? [sec.title, sec.amount, sec.compareAmount ?? 0, sec.changeAmount ?? 0, sec.changePercent ?? '-']
            : [sec.title, sec.amount]
        );
      } else {
        rows.push(
          reportResult.hasComparison
            ? [sec.title, sec.amount, sec.compareAmount ?? 0, sec.changeAmount ?? 0, sec.changePercent ?? '-']
            : [sec.title, sec.amount]
        );
        for (const acc of sec.accounts) {
          rows.push(
            reportResult.hasComparison
              ? [`  [${acc.code}] ${acc.title}`, acc.amount, acc.compareAmount ?? 0, acc.changeAmount ?? 0, acc.changePercent ?? '-']
              : [`  [${acc.code}] ${acc.title}`, acc.amount]
          );
        }
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '自訂報表');
    XLSX.writeFile(wb, `${reportResult.templateName}_${reportResult.startDate}_${reportResult.endDate}.xlsx`);
  };

  // 儲存範本
  const handleSaveTemplate = async (data: SaveCustomReportTemplatePayload) => {
    if (editingTemplate) {
      await accountingApi.updateCustomReportTemplate(editingTemplate.id, data);
    } else {
      const created = await accountingApi.createCustomReportTemplate(data);
      setSelectedTemplateId(created.id);
    }
    await mutate('/api/CustomReports/templates');
    if (reportQueryKey) {
      await mutate(reportQueryKey);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">未授權存取</h2>
        <p className="text-slate-500">自訂財務與經營報表屬於高度機密，僅限管理員 (Admin) 與會計人員 (Accountant) 查閱。</p>
      </div>
    );
  }

  const currentTemplate = templates.find(t => t.id === activeTemplateId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: '首頁', href: '/' },
          { label: '會計系統 (Accounting)', href: '/accounting' },
          { label: '自訂財務報表' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            自訂財務與經營報表 (Custom Reports)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            彈性配置科目分組、借貸向定義、小計計算公式與跨期間對比分析。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTemplate(currentTemplate);
              setIsTemplateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            編輯此範本
          </button>
          <button
            onClick={() => {
              setEditingTemplate(undefined);
              setIsTemplateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增範本
          </button>
        </div>
      </div>

      {/* 篩選與工具列 */}
      <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* 範本下拉選單 */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              選擇報表範本
            </label>
            <select
              value={selectedTemplateId ?? ''}
              onChange={e => setSelectedTemplateId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* 日期區間 */}
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                查詢期間 (起訖日)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-slate-400">至</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 快速標籤 */}
            <div className="self-end flex items-center gap-1 pb-0.5">
              <button
                type="button"
                onClick={() => handlePresetDate('thisMonth')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-600 font-medium"
              >
                本月
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate('lastMonth')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-600 font-medium"
              >
                上月
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate('thisQuarter')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-600 font-medium"
              >
                本季
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate('thisYear')}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-600 font-medium"
              >
                今年
              </button>
            </div>
          </div>
        </div>

        {/* 期間對比區塊 */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={enableCompare}
                onChange={e => {
                  setEnableCompare(e.target.checked);
                  if (e.target.checked && !compareStartDate) {
                    handlePresetDate('thisMonth');
                  }
                }}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>啟用比較期間 (同期/前期對比)</span>
            </label>

            {enableCompare && (
              <div className="flex items-center gap-2 pl-2">
                <input
                  type="date"
                  value={compareStartDate}
                  onChange={e => setCompareStartDate(e.target.value)}
                  className="px-2.5 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-slate-400 text-xs">至</span>
                <input
                  type="date"
                  value={compareEndDate}
                  onChange={e => setCompareEndDate(e.target.value)}
                  className="px-2.5 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              列印
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              匯出 Excel
            </button>
          </div>
        </div>
      </div>

      {/* 報表主體內容 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            運算自訂報表中...
          </div>
        ) : errorMsg ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
            {errorMsg}
          </div>
        ) : !reportResult ? (
          <div className="py-16 text-center text-slate-500">請選取報表範本與日期進行運算。</div>
        ) : (
          <div>
            {/* 報表標題抬頭 */}
            <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{reportResult.templateName}</h2>
              {reportResult.description && (
                <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">{reportResult.description}</p>
              )}
              <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-500 mt-2">
                <span>期間：{reportResult.startDate} ~ {reportResult.endDate}</span>
                {reportResult.hasComparison && (
                  <span className="text-indigo-600">
                    比較基準：{reportResult.compareStartDate} ~ {reportResult.compareEndDate}
                  </span>
                )}
              </div>
            </div>

            {/* 報表表格 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                    <th className="px-6 py-3.5">報表項目 / 會計科目</th>
                    <th className="px-6 py-3.5 text-right w-44">本期金額</th>
                    {reportResult.hasComparison && (
                      <>
                        <th className="px-6 py-3.5 text-right w-44">比較期金額</th>
                        <th className="px-6 py-3.5 text-right w-36">變動金額</th>
                        <th className="px-6 py-3.5 text-right w-28">變動率</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-sans">
                  {reportResult.sections.map(sec => {
                    const isCollapsed = collapsedSections[sec.id];
                    const hasDetails = sec.accounts && sec.accounts.length > 0;

                    return (
                      <React.Fragment key={sec.id}>
                        {/* 段落主行 */}
                        <tr
                          className={`transition-colors ${
                            sec.isSubtotal
                              ? 'bg-slate-100/70 font-semibold text-slate-900 border-t border-b border-slate-200'
                              : 'hover:bg-slate-50 font-medium text-slate-800'
                          }`}
                        >
                          <td className="px-6 py-3 flex items-center gap-2">
                            {hasDetails && !sec.isSubtotal ? (
                              <button
                                type="button"
                                onClick={() => toggleSection(sec.id)}
                                className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                              >
                                {isCollapsed ? (
                                  <ChevronRight className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            ) : (
                              <span className="w-5" />
                            )}
                            <span>{sec.title}</span>
                            {sec.isSubtotal && (
                              <span className="text-[11px] font-mono font-normal text-slate-400 ml-1">
                                {sec.formulaExpression ? `(${sec.formulaExpression})` : ''}
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-3 text-right font-mono font-medium">
                            {formatMoney(sec.amount)}
                          </td>

                          {reportResult.hasComparison && (
                            <>
                              <td className="px-6 py-3 text-right font-mono text-slate-600">
                                {formatMoney(sec.compareAmount)}
                              </td>
                              <td className="px-6 py-3 text-right font-mono">
                                <span
                                  className={
                                    (sec.changeAmount ?? 0) > 0
                                      ? 'text-emerald-600'
                                      : (sec.changeAmount ?? 0) < 0
                                      ? 'text-rose-600'
                                      : 'text-slate-500'
                                  }
                                >
                                  {formatMoney(sec.changeAmount)}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right font-mono text-xs">
                                {sec.changePercent !== null && sec.changePercent !== undefined ? (
                                  <span
                                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                                      sec.changePercent > 0
                                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                                        : sec.changePercent < 0
                                        ? 'bg-rose-50 text-rose-700 font-medium'
                                        : 'text-slate-500'
                                    }`}
                                  >
                                    {sec.changePercent > 0 ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : sec.changePercent < 0 ? (
                                      <TrendingDown className="w-3 h-3" />
                                    ) : null}
                                    {sec.changePercent > 0 ? `+${sec.changePercent}%` : `${sec.changePercent}%`}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            </>
                          )}
                        </tr>

                        {/* 科目明細展開列表 (非小計段落且未折疊) */}
                        {!sec.isSubtotal &&
                          !isCollapsed &&
                          hasDetails &&
                          sec.accounts.map(acc => (
                            <tr key={acc.code} className="bg-slate-50/30 hover:bg-slate-50/70 text-xs text-slate-600">
                              <td className="px-6 py-2 pl-14 flex items-center gap-2">
                                <span className="font-mono text-slate-400">[{acc.code}]</span>
                                <span>{acc.title}</span>
                              </td>
                              <td className="px-6 py-2 text-right font-mono">{formatMoney(acc.amount)}</td>
                              {reportResult.hasComparison && (
                                <>
                                  <td className="px-6 py-2 text-right font-mono text-slate-500">
                                    {formatMoney(acc.compareAmount)}
                                  </td>
                                  <td className="px-6 py-2 text-right font-mono">
                                    <span
                                      className={
                                        (acc.changeAmount ?? 0) > 0
                                          ? 'text-emerald-600'
                                          : (acc.changeAmount ?? 0) < 0
                                          ? 'text-rose-600'
                                          : 'text-slate-400'
                                      }
                                    >
                                      {formatMoney(acc.changeAmount)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-2 text-right font-mono text-[11px] text-slate-500">
                                    {acc.changePercent !== null && acc.changePercent !== undefined ? (
                                      <span>
                                        {acc.changePercent > 0 ? `+${acc.changePercent}%` : `${acc.changePercent}%`}
                                      </span>
                                    ) : (
                                      '-'
                                    )}
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 範本配置 Modal */}
      <CustomReportTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
        initialData={editingTemplate}
      />
    </div>
  );
}
