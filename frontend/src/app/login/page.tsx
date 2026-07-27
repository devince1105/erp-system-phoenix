"use client";

import { useState } from "react";
import { useAuth } from "@/features/core/contexts/AuthContext";
import { Hexagon, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import axiosClient from "@/api/axiosClient";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Intercept Mock Passwords (For prototyping Admin Reset Password)
      const mockPasswordsStr = typeof window !== 'undefined' ? localStorage.getItem('mock_passwords') : null;
      if (mockPasswordsStr) {
        const mockPasswords = JSON.parse(mockPasswordsStr);
        if (mockPasswords[username] && mockPasswords[username].pwd === password) {
          login("mock-token", {
            id: parseInt(mockPasswords[username].id.replace('EMP-', '')),
            username: mockPasswords[username].id,
            fullName: mockPasswords[username].name,
            email: `${username}@phoenix.erp`,
            roles: []
          });
          return;
        }
      }

      // 2. Normal Backend Login
      const res = await axiosClient.post("/auth/login", { username, password });
      const data = res.data;

      login(data.token, data.user);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "登入失敗，請檢查網路連線");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-slate-950">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mb-6 shadow-sm dark:shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Hexagon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Phoenix ERP</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to access your modular workspace</p>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-sm border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-sm p-4 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-800 rounded-sm bg-gray-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-slate-800 rounded-sm bg-gray-50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
              <span className="w-8 h-px bg-slate-200 dark:bg-slate-800"></span>
              快速登入測試 (RBAC 驗證)
              <span className="w-8 h-px bg-slate-200 dark:bg-slate-800"></span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  login("mock-token", { id: 1, username: 'EMP-001', fullName: '王大明', email: 'e001@phoenix.erp', roles: [] });
                }}
                className="py-2 px-3 text-sm border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                登入為 王大明 (業務)
              </button>
              <button
                type="button"
                onClick={() => {
                  login("mock-token", { id: 2, username: 'EMP-002', fullName: '陳小美', email: 'e002@phoenix.erp', roles: [] });
                }}
                className="py-2 px-3 text-sm border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                登入為 陳小美 (人資)
              </button>
              <button
                type="button"
                onClick={() => {
                  login("mock-token", { id: 3, username: 'EMP-003', fullName: '林志豪', email: 'e003@phoenix.erp', roles: [] });
                }}
                className="py-2 px-3 text-sm border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                登入為 林志豪 (會計)
              </button>
              <button
                type="button"
                onClick={() => {
                  login("mock-token", { id: 999, username: 'admin', fullName: 'Admin', email: 'admin@phoenix.erp', roles: ['admin'] });
                }}
                className="py-2 px-3 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                登入為 管理員 (全限)
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-6">
          上方快速按鈕將繞過後端驗證，直接注入身份以供測試側邊欄選單變化。
        </p>
      </div>
    </div>
  );
}
