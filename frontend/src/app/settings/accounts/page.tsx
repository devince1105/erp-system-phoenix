"use client";

import React, { useEffect, useState } from 'react';
import { ShieldAlert, KeyRound, UserX, UserCheck, Search, ShieldCheck, X, Mail, RefreshCw, Type, Copy, CheckCircle2 } from 'lucide-react';
import { hrApi } from '@/features/hr/api/hrApi';

// Mock Account state
interface Account {
  empId: string;
  username: string;
  isActive: boolean;
  lastLogin: string;
}

export default function AccountManagementPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Record<string, Account>>({});

  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetModal, setResetModal] = useState<{ id: string, name: string, username: string } | null>(null);
  const [resetMethod, setResetMethod] = useState<'email' | 'auto' | 'manual'>('email');
  const [manualPassword, setManualPassword] = useState('');
  const [successState, setSuccessState] = useState<{ method: string, empName: string, password?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    hrApi.getEmployees().then(data => {
      setEmployees(data);
      // Initialize mock accounts
      const accs: Record<string, Account> = {};
      data.forEach(emp => {
        const empId = `EMP-${emp.id.toString().padStart(3, '0')}`;
        accs[empId] = {
          empId,
          username: emp.email.split('@')[0],
          isActive: true,
          lastLogin: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
        };
      });
      setAccounts(accs);
    });
  }, []);

  const toggleActive = (id: string) => {
    setAccounts(prev => ({
      ...prev,
      [id]: { ...prev[id], isActive: !prev[id].isActive }
    }));
  };

  const handleConfirmReset = () => {
    if (!resetModal) return;
    
    setResettingId(resetModal.id);
    const empName = resetModal.name;
    const method = resetMethod;
    const pwd = manualPassword;

    setTimeout(() => {
      let finalPwd = '';
      if (method === 'auto') {
        finalPwd = Math.random().toString(36).slice(-8) + '!';
      } else if (method === 'manual') {
        finalPwd = pwd;
      }
      
      if (finalPwd) {
        const stored = JSON.parse(localStorage.getItem('mock_passwords') || '{}');
        stored[resetModal.username] = { pwd: finalPwd, id: resetModal.id, name: empName };
        localStorage.setItem('mock_passwords', JSON.stringify(stored));
      }
      
      setSuccessState({
        method,
        empName,
        password: finalPwd
      });
      setResettingId(null);
    }, 600);
  };

  const handleCloseModal = () => {
    setResetModal(null);
    setSuccessState(null);
    setManualPassword('');
    setCopied(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-rose-500" />
          帳號安全管理 (Account Management)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">獨立於人事系統之外，專門用於管控員工登入 ERP 的系統權限與密碼安全。</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <div className="relative w-64">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="text" placeholder="搜尋員工帳號..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">員工資訊</th>
                <th className="px-6 py-4 whitespace-nowrap">登入帳號 (Username)</th>
                <th className="px-6 py-4 whitespace-nowrap">最後登入時間</th>
                <th className="px-6 py-4 whitespace-nowrap">帳號狀態</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
              {employees.map(emp => {
                const empId = `EMP-${emp.id.toString().padStart(3, '0')}`;
                const acc = accounts[empId];
                if (!acc) return null;
                
                return (
                  <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{emp.name}</span>
                        <span className="text-xs text-slate-500">{emp.department?.name || '未分類'} | {emp.jobTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-indigo-600 dark:text-indigo-400">
                      {acc.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {acc.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleActive(empId)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${acc.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/60' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/60'}`}
                      >
                        {acc.isActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {acc.isActive ? '正常啟用' : '已停權'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setResetModal({ id: empId, name: emp.name, username: acc.username })}
                        disabled={resettingId === empId}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                      >
                        {resettingId === empId ? (
                          <span className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin inline-block"></span>
                        ) : (
                          <KeyRound className="w-4 h-4 text-amber-500" />
                        )}
                        {resettingId === empId ? '處理中...' : '重設密碼'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                重設員工密碼
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {successState ? (
              <div className="p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">重設作業已完成</h4>
                
                {successState.method === 'email' ? (
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    已寄送包含密碼重設連結的信件至 <span className="font-semibold text-slate-900 dark:text-white">{successState.empName}</span> 的企業信箱。<br/>員工可直接透過信件完成密碼重設。
                  </p>
                ) : (
                  <div className="mt-6">
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                      請將以下臨時密碼複製並透過 Slack/Teams 傳送給 <span className="font-semibold text-slate-900 dark:text-white">{successState.empName}</span>：
                    </p>
                    <div className="relative group">
                      <div className="bg-gray-100 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                        <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tracking-wider">
                          {successState.password}
                        </span>
                        <button 
                          onClick={() => handleCopy(successState.password || '')}
                          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium ${copied ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm border border-gray-200 dark:border-slate-700'}`}
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? '已複製' : '複製'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-4 flex items-center justify-center gap-1">
                      <ShieldAlert className="w-4 h-4" />
                      系統已強制要求該員工下次登入時必須更改密碼
                    </p>
                  </div>
                )}
                
                <button 
                  onClick={handleCloseModal}
                  className="mt-8 w-full py-2.5 text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                >
                  關閉視窗
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-6">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      您正在為 <span className="font-bold text-slate-900 dark:text-white">{resetModal.name}</span> 執行密碼重設作業，請選擇重設方式：
                    </p>
                
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${resetMethod === 'email' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                    <input type="radio" name="resetMethod" value="email" checked={resetMethod === 'email'} onChange={() => setResetMethod('email')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                    <Mail className={`w-5 h-5 ${resetMethod === 'email' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <div>
                      <div className={`text-sm font-medium ${resetMethod === 'email' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>發送重設信件</div>
                      <div className="text-xs text-slate-500">系統自動寄送包含一次性連結的信件</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${resetMethod === 'auto' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                    <input type="radio" name="resetMethod" value="auto" checked={resetMethod === 'auto'} onChange={() => setResetMethod('auto')} className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500" />
                    <RefreshCw className={`w-5 h-5 ${resetMethod === 'auto' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div>
                      <div className={`text-sm font-medium ${resetMethod === 'auto' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>系統隨機產生</div>
                      <div className="text-xs text-slate-500">產生 8 碼隨機亂數密碼並強制下次登入修改</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${resetMethod === 'manual' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                    <input type="radio" name="resetMethod" value="manual" checked={resetMethod === 'manual'} onChange={() => setResetMethod('manual')} className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500" />
                    <Type className={`w-5 h-5 ${resetMethod === 'manual' ? 'text-amber-500' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${resetMethod === 'manual' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>手動設定臨時密碼</div>
                      <div className="text-xs text-slate-500">由管理員自訂一組臨時密碼</div>
                    </div>
                  </label>
                  
                  {resetMethod === 'manual' && (
                    <div className="pl-9 pr-2 pt-1 pb-2 animate-in fade-in slide-in-from-top-2">
                      <input 
                        type="text" 
                        placeholder="請輸入臨時密碼..." 
                        value={manualPassword}
                        onChange={(e) => setManualPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/80 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmReset}
                disabled={resetMethod === 'manual' && manualPassword.length < 4}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                確認執行
              </button>
            </div>
          </>
        )}
      </div>
    </div>
      )}
    </div>
  );
}
