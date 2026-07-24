'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { accountingApi, AccountTitle, CreateVoucherDto, Voucher } from '@/features/accounting/api/accountingApi';
import { ArrowLeft, Save, Plus, Trash2, Calculator, AlertCircle } from 'lucide-react';

interface DetailRow {
  id: string; // for React key
  accountTitleId: number;
  isDebit: boolean;
  amount: string; // use string for easy input handling
  summary: string;
}

export default function EditVoucherPage() {
  const router = useRouter();
  const params = useParams();
  const voucherId = parseInt(params.id as string);
  
  // Master data
  const [accountTitles, setAccountTitles] = useState<AccountTitle[]>([]);
  
  // Form State
  const [voucherDate, setVoucherDate] = useState('');
  const [type, setType] = useState(0); // 0=General
  const [memo, setMemo] = useState('');
  
  const [details, setDetails] = useState<DetailRow[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const titles = await accountingApi.getAccountTitles();
        setAccountTitles(titles.filter(a => a.isActive));

        const voucher = await accountingApi.getVoucher(voucherId);
        
        // If it's posted, it shouldn't be edited
        if (voucher.status !== 0) {
          setError('已過帳之傳票基於商業會計法規範不得直接修改！請開立沖銷傳票。');
        }

        setVoucherDate(voucher.voucherDate.split('T')[0]);
        setType(voucher.type);
        setMemo(voucher.memo || '');
        
        setDetails(voucher.details.map(d => ({
          id: crypto.randomUUID(),
          accountTitleId: d.accountTitleId,
          isDebit: d.isDebit,
          amount: d.amount.toString(),
          summary: d.summary || ''
        })));
      } catch (err: any) {
        setError(err.response?.data || err.message || '載入失敗');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (voucherId) {
      fetchData();
    }
  }, [voucherId]);

  const totalDebit = useMemo(() => {
    return details.filter(d => d.isDebit).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  }, [details]);

  const totalCredit = useMemo(() => {
    return details.filter(d => !d.isDebit).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  }, [details]);

  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const addDetailRow = () => {
    setDetails([
      ...details,
      { id: crypto.randomUUID(), accountTitleId: 0, isDebit: true, amount: '', summary: '' }
    ]);
  };

  const removeDetailRow = (id: string) => {
    if (details.length <= 2) return; // Min 2 rows
    setDetails(details.filter(d => d.id !== id));
  };

  const updateDetail = (id: string, field: keyof DetailRow, value: any) => {
    setDetails(details.map(d => {
      if (d.id === id) {
        return { ...d, [field]: value };
      }
      return d;
    }));
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!isBalanced) {
      setError('借貸不平衡，請確認金額是否正確輸入。');
      return;
    }
    
    if (details.some(d => d.accountTitleId === 0 || !d.amount || parseFloat(d.amount) <= 0)) {
      setError('請確實填寫所有明細的科目與金額。');
      return;
    }

    setIsSaving(true);
    try {
      const payload: CreateVoucherDto = {
        voucherDate,
        type,
        memo,
        details: details.map(d => ({
          accountTitleId: d.accountTitleId,
          isDebit: d.isDebit,
          amount: parseFloat(d.amount),
          summary: d.summary
        }))
      };

      await accountingApi.updateVoucher(voucherId, payload);
      router.push('/accounting/vouchers');
    } catch (err: any) {
      setError(err.response?.data?.title || err.response?.data || err.message || '儲存失敗');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-slate-500">載入中...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/accounting/vouchers" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">編輯傳票</h1>
            <p className="text-sm text-slate-500">修改草稿狀態的會計分錄。</p>
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSaving || !isBalanced || error.includes('不得直接修改')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-sm shadow-sm shadow-blue-600/20 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '儲存中...' : '儲存變更'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-sm bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
        
        {/* Header Info */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">傳票日期</label>
            <input 
              type="date" 
              value={voucherDate}
              onChange={e => setVoucherDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">傳票類型</label>
            <select 
              value={type}
              onChange={e => setType(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 transition-all"
            >
              <option value={0}>普通傳票</option>
              <option value={1}>現金付款傳票</option>
              <option value={2}>現金收款傳票</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">摘要 / 備註</label>
            <input 
              type="text" 
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="例如：辦公用品採購"
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-200 transition-all"
            />
          </div>
        </div>

        {/* Details Entry */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">傳票明細</h3>
            <button 
              onClick={addDetailRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
            >
              <Plus className="w-4 h-4" />
              新增明細列
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-y border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 w-32">借/貸</th>
                  <th className="px-4 py-3 w-64">會計科目</th>
                  <th className="px-4 py-3">摘要 / 備註</th>
                  <th className="px-4 py-3 w-40 text-right">金額</th>
                  <th className="px-4 py-3 w-16 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {details.map((row) => (
                  <tr key={row.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <select 
                        value={row.isDebit ? 'debit' : 'credit'}
                        onChange={e => updateDetail(row.id, 'isDebit', e.target.value === 'debit')}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
                      >
                        <option value="debit">借 Debit</option>
                        <option value="credit">貸 Credit</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={row.accountTitleId}
                        onChange={e => updateDetail(row.id, 'accountTitleId', parseInt(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300"
                      >
                        <option value={0} disabled>請選擇科目...</option>
                        {accountTitles.map(a => (
                          <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={row.summary}
                        onChange={e => updateDetail(row.id, 'summary', e.target.value)}
                        placeholder="請輸入摘要"
                        className="w-full px-3 py-1.5 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-blue-500 rounded text-sm focus:outline-none dark:text-slate-200 transition-colors"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={row.amount}
                          onChange={e => updateDetail(row.id, 'amount', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-1.5 text-right font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => removeDetailRow(row.id)}
                        disabled={details.length <= 2}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Totals */}
          <div className="mt-6 flex flex-col md:flex-row items-center justify-end gap-6 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-12 text-sm">
              <div className="space-y-1 text-right">
                <p className="text-slate-500 font-semibold text-[11px] tracking-wider">借方總計</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  ${totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-px h-10 bg-slate-300 dark:bg-slate-700" />
              <div className="space-y-1 text-right">
                <p className="text-slate-500 font-semibold text-[11px] tracking-wider">貸方總計</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  ${totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-sm font-medium text-sm border ${
              isBalanced 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' 
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50'
            }`}>
              <Calculator className="w-4 h-4" />
              {isBalanced ? '借貸平衡' : '借貸不平衡'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
