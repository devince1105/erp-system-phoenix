"use client";

import React, { useState } from "react";
import { Settings, FileText, Plus, GripVertical, Trash2, CheckCircle2, Users, Briefcase, Edit2, Check, X, Crown } from "lucide-react";
import { Breadcrumbs } from "@/features/core/components/Breadcrumbs";

// module-scoped counter for unique workflow step ids (avoids impure Date.now in render path)
let workflowStepSeq = 0;

type RoleType = 'DirectSupervisor' | 'DepartmentManager' | 'Director' | 'ProjectManager' | 'HR' | 'Finance' | 'SpecificUser' | 'CEO';

interface WorkflowStep {
  id: string;
  role: RoleType;
  label: string;
  isRequired: boolean;
}

interface FormWorkflow {
  id: string;
  formType: string;
  formLabel: string;
  steps: WorkflowStep[];
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<FormWorkflow[]>([
    {
      id: 'wf-1',
      formType: 'Expense',
      formLabel: '費用報銷單',
      steps: [
        { id: 's1', role: 'ProjectManager', label: '專案經理 (PM)', isRequired: true },
        { id: 's2', role: 'DepartmentManager', label: '部門主管', isRequired: true },
        { id: 's3', role: 'Finance', label: '財務部', isRequired: true },
      ]
    },
    {
      id: 'wf-2',
      formType: 'Leave',
      formLabel: '請假申請單',
      steps: [
        { id: 's4', role: 'DirectSupervisor', label: '直屬主管', isRequired: true },
        { id: 's5', role: 'DepartmentManager', label: '部門主管', isRequired: true },
      ]
    },
    {
      id: 'wf-3',
      formType: 'Purchase',
      formLabel: '採購申請單',
      steps: [
        { id: 's6', role: 'DirectSupervisor', label: '直屬主管', isRequired: true },
        { id: 's7', role: 'Finance', label: '財務部', isRequired: true },
      ]
    }
  ]);

  const [activeWorkflowId, setActiveWorkflowId] = useState('wf-1');
  const activeWorkflow = workflows.find(w => w.id === activeWorkflowId);

  const [isAddingForm, setIsAddingForm] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [editFormName, setEditFormName] = useState("");

  const handleAddForm = () => {
    if (!newFormName.trim()) return;
    const newId = `wf-${Date.now()}`;
    const newWf: FormWorkflow = {
      id: newId,
      formType: `Custom_${Date.now()}`,
      formLabel: newFormName.trim(),
      steps: []
    };
    setWorkflows([...workflows, newWf]);
    setActiveWorkflowId(newId);
    setNewFormName("");
    setIsAddingForm(false);
  };

  const handleUpdateForm = (id: string) => {
    if (!editFormName.trim()) return;
    setWorkflows(prev => prev.map(wf => wf.id === id ? { ...wf, formLabel: editFormName.trim() } : wf));
    setEditingFormId(null);
  };

  const handleDeleteForm = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("確定要刪除此表單類型及其簽核流程嗎？")) {
      const remaining = workflows.filter(wf => wf.id !== id);
      setWorkflows(remaining);
      if (activeWorkflowId === id && remaining.length > 0) {
        setActiveWorkflowId(remaining[0].id);
      } else if (activeWorkflowId === id && remaining.length === 0) {
        setActiveWorkflowId("");
      }
    }
  };

  const availableRoles = [
    { type: 'DirectSupervisor', label: '直屬主管', icon: Users },
    { type: 'DepartmentManager', label: '部門主管', icon: Users },
    { type: 'Director', label: '總監 / 處長 (Director)', icon: Users },
    { type: 'ProjectManager', label: '專案經理 (PM)', icon: Briefcase },
    { type: 'HR', label: '人力資源部 (HR)', icon: Users },
    { type: 'Finance', label: '財務部', icon: Users },
    { type: 'CEO', label: '總經理 / 老闆 (CEO)', icon: Crown },
  ];

  const handleAddStep = (roleType: RoleType, label: string) => {
    if (!activeWorkflow) return;
    const newStep: WorkflowStep = {
      id: `s-${++workflowStepSeq}`,
      role: roleType,
      label,
      isRequired: true
    };
    
    setWorkflows(prev => prev.map(wf => 
      wf.id === activeWorkflowId 
        ? { ...wf, steps: [...wf.steps, newStep] }
        : wf
    ));
  };

  const handleRemoveStep = (stepId: string) => {
    if (!activeWorkflow) return;
    setWorkflows(prev => prev.map(wf => 
      wf.id === activeWorkflowId 
        ? { ...wf, steps: wf.steps.filter(s => s.id !== stepId) }
        : wf
    ));
  };

  const handleSave = () => {
    // Mock save
    alert("✅ 簽核流程已成功儲存並生效！");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumbs items={[
        { label: '首頁', href: '/' },
        { label: '系統設定', href: '/settings/permissions' },
        { label: '簽核流程設定' }
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            簽核流程設定 (Approval Workflows)
          </h1>
          <p className="text-sm text-slate-500 mt-1">動態設定不同表單的簽核關卡與路由規則</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          儲存流程設定
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Form Types */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">選擇表單類型</h3>
          </div>
          <div className="p-2 space-y-1 flex-1 overflow-y-auto max-h-[60vh]">
            {workflows.map(wf => (
              <div
                key={wf.id}
                onClick={() => {
                  if (editingFormId !== wf.id) setActiveWorkflowId(wf.id);
                }}
                className={`group w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  activeWorkflowId === wf.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-gray-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                {editingFormId === wf.id ? (
                  <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                    <input 
                      autoFocus
                      type="text" 
                      value={editFormName}
                      onChange={e => setEditFormName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdateForm(wf.id)}
                      className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                    />
                    <button onClick={() => handleUpdateForm(wf.id)} className="text-emerald-600 hover:text-emerald-700 p-1">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingFormId(null)} className="text-slate-400 hover:text-slate-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <FileText className={`w-4 h-4 shrink-0 ${activeWorkflowId === wf.id ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className="truncate">{wf.formLabel}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditFormName(wf.formLabel); setEditingFormId(wf.id); }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/50 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteForm(wf.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 dark:hover:bg-rose-900/50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {isAddingForm ? (
              <div className="px-3 py-3 border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl mt-2">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="輸入新表單名稱..."
                  value={newFormName}
                  onChange={e => setNewFormName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddForm()}
                  className="w-full px-2 py-1.5 text-sm border border-blue-200 dark:border-blue-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:text-white mb-2"
                />
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setIsAddingForm(false)} className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">取消</button>
                  <button onClick={handleAddForm} className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">新增</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingForm(true)}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors border border-dashed border-gray-300 dark:border-slate-700"
              >
                <Plus className="w-4 h-4" />
                新增自訂表單
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Workflow Builder */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">[{activeWorkflow?.formLabel}]</span> 的簽核關卡設計
            </h3>
          </div>
          
          <div className="p-6 bg-slate-50/50 dark:bg-slate-900/20 flex-1 flex flex-col md:flex-row gap-8">
            
            {/* Current Steps */}
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">當前流程順序</h4>
              
              <div className="space-y-3 relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-blue-200 dark:bg-blue-900/50 z-0" />

                {activeWorkflow?.steps.map((step, index) => (
                  <div key={step.id} className="relative z-10 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-500 flex items-center justify-center shadow-sm shrink-0 font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center justify-between group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{step.label}</p>
                          <p className="text-xs text-slate-500">角色代碼: {step.role}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveStep(step.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {activeWorkflow?.steps.length === 0 && (
                  <div className="relative z-10 flex flex-col items-center justify-center py-10 bg-white/50 dark:bg-slate-800/30 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl">
                    <p className="text-slate-500 font-medium">目前尚無任何簽核關卡</p>
                  </div>
                )}

                <div className="relative z-10 flex items-center gap-4 pt-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-500">流程結束 (歸檔/生效)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Roles Palette */}
            <div className="w-full md:w-64 shrink-0">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">加入新關卡</h4>
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 shadow-sm space-y-2">
                {availableRoles.map((role, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleAddStep(role.type as RoleType, role.label)}
                    className="w-full flex items-center gap-3 p-3 border border-gray-100 dark:border-slate-700/50 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                      <role.icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{role.label}</p>
                    </div>
                    <Plus className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
