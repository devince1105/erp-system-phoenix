"use client";

import React from "react";
import { ApprovalInstance } from "@/features/hr/types/hr";
import { Check, X, Clock } from "lucide-react";

/**
 * Reusable approval-flow visualiser (簽核流程). Shows each step in order and
 * highlights the one the document is currently waiting on — so an applicant can
 * see "which manager is it stuck at". Works for any form type's instance.
 */
export function ApprovalFlow({ instance, compact = false }: { instance: ApprovalInstance | null; compact?: boolean }) {
  if (!instance || instance.steps.length === 0) {
    return <span className="text-xs text-slate-400">尚無簽核流程</span>;
  }

  const steps = [...instance.steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const currentLabel = steps.find((s) => s.stepOrder === instance.currentStepOrder)?.label;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        {instance.status === "Approved" ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"><Check className="w-3 h-3" />核准完成</span>
        ) : instance.status === "Rejected" ? (
          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium"><X className="w-3 h-3" />已駁回</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <Clock className="w-3 h-3" />待「{currentLabel}」簽核
          </span>
        )}
        <span className="text-slate-400">
          （{steps.filter((s) => s.status === "Approved").length}/{steps.length}）
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        {steps.map((s, idx) => {
          const isCurrent = instance.status === "Pending" && s.stepOrder === instance.currentStepOrder;
          const done = s.status === "Approved";
          const rejected = s.status === "Rejected";
          const circle = rejected
            ? "bg-red-500 border-red-500 text-white"
            : done
            ? "bg-emerald-500 border-emerald-500 text-white"
            : isCurrent
            ? "bg-white dark:bg-slate-900 border-amber-500 text-amber-600 ring-4 ring-amber-500/20 animate-pulse"
            : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400";
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center text-center min-w-[84px]">
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold ${circle}`}>
                  {rejected ? <X className="w-4 h-4" /> : done ? <Check className="w-4 h-4" /> : s.stepOrder}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${isCurrent ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"}`}>{s.label}</span>
                {isCurrent && <span className="text-[10px] text-amber-500 mt-0.5">審核中</span>}
                {done && s.decidedAt && <span className="text-[10px] text-slate-400 mt-0.5">{new Date(s.decidedAt).toLocaleDateString()}</span>}
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${done ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {steps.some((s) => s.comment) && (
        <div className="space-y-1 pt-1">
          {steps.filter((s) => s.comment).map((s) => (
            <p key={s.id} className="text-xs text-slate-500">
              <span className="font-medium text-slate-600 dark:text-slate-300">{s.label}</span>
              （{s.status === "Approved" ? "核准" : s.status === "Rejected" ? "駁回" : s.status}）：{s.comment}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
