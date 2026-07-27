"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, XCircle, CheckCircle, Clock, Plus, Paperclip, UploadCloud, FileText, User, Briefcase, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";
import { hrApi } from "@/features/hr/api/hrApi";
import { ApprovalRequest, Project } from "@/features/hr/types/hr";
import { useAuth } from "@/features/core/contexts/AuthContext";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"pending" | "my-requests" | "history">("pending");
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'Expense',
    title: '',
    projectId: '',
    amount: '',
    details: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from backend based on the tab
      // For now, we mock the response data since we are in prototyping phase
      const mockApprovals: ApprovalRequest[] = [
        {
          id: 101,
          type: 'Expense',
          requesterId: 2,
          requester: { id: 2, name: '李明哲', email: 'mingzhe.li@phoenix.com', status: 1, jobTitle: '業務專員', baseSalary: 45000, hireDate: '2023-01-15', createdAt: '' },
          projectId: 1,
          project: { id: 1, name: '鼎新系統導入專案', code: 'PRJ-2601', managerId: 1, status: 'Active', createdAt: '' },
          title: '高鐵交通費報銷',
          amount: 1490,
          details: '前往台中高鐵票來回',
          status: 'Pending',
          currentStep: 1,
          expectedApproverIds: [1],
          createdAt: '2026-07-26T08:30:00Z',
          attachments: [
            { id: 1, fileName: 'receipt_thsr.pdf', fileUrl: '#', fileSize: 1024 * 500, uploadedAt: '2026-07-26T08:30:00Z' }
          ]
        }
      ];
      setApprovals(mockApprovals);
      
      const mockProjects: Project[] = [
        { id: 1, name: '鼎新系統導入專案', code: 'PRJ-2601', managerId: 1, status: 'Active', createdAt: '' },
        { id: 2, name: 'Q3 企業參展', code: 'PRJ-2602', managerId: 3, status: 'Active', createdAt: '' }
      ];
      setProjects(mockProjects);
      
    } catch (error) {
      console.error("Failed to fetch approvals data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [activeTab]);

  const handleApprove = async (id: number) => {
    try {
      // await hrApi.processApproval(id, 'Approved', '');
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert("核准失敗");
    }
  };

  const handleReject = async (id: number) => {
    try {
      // await hrApi.processApproval(id, 'Rejected', '');
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert("退回失敗");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleSubmitNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("簽核單已送出 (Mock)");
    setIsModalOpen(false);
    setNewRequest({ type: 'Expense', title: '', projectId: '', amount: '', details: '' });
    setUploadedFiles([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '人力資源系統 (HRM)', href: '/hr' },
        { label: '簽核中心' }
      ]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-blue-600" />
            簽核中心 (Approval Hub)
          </h1>
          <p className="text-sm text-slate-500 mt-1">統一處理專案報銷、請假與各類申請表單</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          發起新表單
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-6 px-6 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-4 font-bold text-sm border-b-2 transition-colors relative ${
              activeTab === "pending" 
                ? "text-blue-600 border-blue-600" 
                : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            待我簽核
            {activeTab === 'pending' && approvals.length > 0 && (
              <span className="absolute top-3 -right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("my-requests")}
            className={`py-4 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "my-requests" 
                ? "text-blue-600 border-blue-600" 
                : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            我發起的
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-4 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "history" 
                ? "text-blue-600 border-blue-600" 
                : "text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            簽核歷程
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-20 text-center text-slate-500">載入中...</div>
          ) : approvals.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <CheckCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              目前沒有待處理的項目
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {approvals.map(req => (
                <div key={req.id} className="group border border-gray-200 dark:border-slate-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors bg-white dark:bg-slate-800/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-1">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {req.type}
                          </span>
                          {req.project && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {req.project.name}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                          {req.title} {req.amount && <span className="text-blue-600 dark:text-blue-400">NT$ {req.amount.toLocaleString()}</span>}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{req.details}</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <User className="w-4 h-4" />
                            申請人: <span className="font-medium text-slate-700 dark:text-slate-300">{req.requester?.name} ({req.requester?.jobTitle})</span>
                          </div>
                          {req.attachments && req.attachments.length > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                              <Paperclip className="w-4 h-4" />
                              {req.attachments.length} 個附檔
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {activeTab === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-slate-700">
                        <button 
                          onClick={() => handleReject(req.id)}
                          className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800/50 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" /> 退回
                        </button>
                        <button 
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm shadow-emerald-500/20"
                        >
                          <CheckCircle className="w-4 h-4" /> 核准
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">發起新表單</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitNewRequest} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">表單類型</label>
                  <select 
                    value={newRequest.type}
                    onChange={e => setNewRequest({...newRequest, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="Expense">費用報銷單</option>
                    <option value="Leave">請假單</option>
                    <option value="Purchase">採購申請單</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">歸屬專案 (選填)</label>
                  <select 
                    value={newRequest.projectId}
                    onChange={e => setNewRequest({...newRequest, projectId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">-- 無關聯專案 --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">表單主旨</label>
                <input 
                  required
                  type="text"
                  placeholder="例如：6月份高鐵交通費"
                  value={newRequest.title}
                  onChange={e => setNewRequest({...newRequest, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {newRequest.type === 'Expense' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">申請金額 (NT$)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newRequest.amount}
                    onChange={e => setNewRequest({...newRequest, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">詳細說明</label>
                <textarea 
                  rows={3}
                  value={newRequest.details}
                  onChange={e => setNewRequest({...newRequest, details: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-transparent text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                ></textarea>
              </div>

              {/* File Upload Zone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">上傳證明文件 / 附檔</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors relative group">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">點擊或拖曳檔案至此上傳</p>
                  <p className="text-xs text-slate-500 mt-1">支援 PDF, JPG, PNG (最大 10MB)</p>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-slate-700">
                        <Paperclip className="w-4 h-4 text-blue-500" />
                        <span className="truncate flex-1 font-medium">{file.name}</span>
                        <span className="text-xs text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-sm">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Routing Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> 預計簽核流程預覽
                </h4>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 font-medium overflow-x-auto pb-1">
                  {newRequest.projectId ? (
                    <>
                      <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800 whitespace-nowrap">專案經理 (PM)</div>
                      <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800 whitespace-nowrap">部門主管</div>
                      <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800 whitespace-nowrap">財務部</div>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800 whitespace-nowrap">直屬主管</div>
                      <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800 whitespace-nowrap">部門主管</div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> 確認送出
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
