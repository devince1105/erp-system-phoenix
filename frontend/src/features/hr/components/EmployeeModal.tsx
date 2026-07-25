import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Employee, Department, Education, Experience, JobHistory } from "../types/hr";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Partial<Employee>) => Promise<void>;
  initialData?: Employee | null;
  departments: Department[];
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, initialData, departments }) => {
  const [activeTab, setActiveTab] = useState<"work" | "personal" | "education" | "experience" | "jobHistory">("work");
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    email: "",
    departmentId: undefined,
    jobTitle: "",
    baseSalary: 30000,
    hireDate: new Date().toISOString().split("T")[0],
    status: 1,
    phone: "",
    mobile: "",
    lineId: "",
    registeredAddress: "",
    contactAddress: "",
    dateOfBirth: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    educations: [],
    experiences: [],
    jobHistories: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        hireDate: initialData.hireDate.split("T")[0],
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split("T")[0] : "",
        educations: initialData.educations || [],
        experiences: initialData.experiences || [],
        jobHistories: initialData.jobHistories || []
      });
    } else {
      setFormData({
        name: "",
        email: "",
        departmentId: undefined,
        jobTitle: "",
        hireDate: new Date().toISOString().split("T")[0],
        status: 1,
        phone: "",
        mobile: "",
        lineId: "",
        registeredAddress: "",
        contactAddress: "",
        dateOfBirth: "",
        bloodType: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        educations: [],
        experiences: [],
        jobHistories: []
      });
    }
    setActiveTab("work");
  }, [initialData, isOpen]);

  // 計算年齡與星座的輔助函式
  const calculateAgeAndZodiac = (dobStr: string | undefined) => {
    if (!dobStr) return { age: "-", zodiac: "-" };
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return { age: "-", zodiac: "-" };

    // 計算年齡
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms); 
    const age = Math.abs(age_dt.getUTCFullYear() - 1970);

    // 計算星座
    const month = dob.getMonth() + 1;
    const day = dob.getDate();
    let zodiac = "";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiac = "牡羊座";
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiac = "金牛座";
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) zodiac = "雙子座";
    else if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) zodiac = "巨蟹座";
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiac = "獅子座";
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiac = "處女座";
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) zodiac = "天秤座";
    else if ((month === 10 && day >= 24) || (month === 11 && day <= 21)) zodiac = "天蠍座";
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiac = "射手座";
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiac = "摩羯座";
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiac = "水瓶座";
    else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) zodiac = "雙魚座";

    return { age: `${age} 歲`, zodiac };
  };

  const { age, zodiac } = calculateAgeAndZodiac(formData.dateOfBirth);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
        status: Number(formData.status) as 1 | 2 | 3
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("儲存失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEducation = () => {
    setFormData({
      ...formData,
      educations: [
        ...(formData.educations || []),
        { schoolName: "", startDate: new Date().toISOString().split("T")[0] }
      ]
    });
  };

  const handleUpdateEducation = (index: number, field: keyof Education, value: any) => {
    const newEdu = [...(formData.educations || [])];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData({ ...formData, educations: newEdu });
  };

  const handleRemoveEducation = (index: number) => {
    const newEdu = [...(formData.educations || [])];
    newEdu.splice(index, 1);
    setFormData({ ...formData, educations: newEdu });
  };

  const handleAddExperience = () => {
    setFormData({
      ...formData,
      experiences: [
        ...(formData.experiences || []),
        { companyName: "", jobTitle: "", startDate: new Date().toISOString().split("T")[0] }
      ]
    });
  };

  const handleUpdateExperience = (index: number, field: keyof Experience, value: any) => {
    const newExp = [...(formData.experiences || [])];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData({ ...formData, experiences: newExp });
  };

  const handleRemoveExperience = (index: number) => {
    const newExp = [...(formData.experiences || [])];
    newExp.splice(index, 1);
    setFormData({ ...formData, experiences: newExp });
  };

  const handleAddJobHistory = () => {
    setFormData({
      ...formData,
      jobHistories: [
        ...(formData.jobHistories || []),
        { jobTitle: "", startDate: new Date().toISOString().split("T")[0] }
      ]
    });
  };

  const handleUpdateJobHistory = (index: number, field: keyof JobHistory, value: any) => {
    const newJh = [...(formData.jobHistories || [])];
    newJh[index] = { ...newJh[index], [field]: value };
    setFormData({ ...formData, jobHistories: newJh });
  };

  const handleRemoveJobHistory = (index: number) => {
    const newJh = [...(formData.jobHistories || [])];
    newJh.splice(index, 1);
    setFormData({ ...formData, jobHistories: newJh });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {initialData ? "編輯員工資料" : "新增員工"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 shrink-0 pt-2 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "work"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("work")}
          >
            工作資訊
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "personal"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            個人/聯絡資料
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "education"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("education")}
          >
            最高學歷
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "experience"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("experience")}
          >
            過往經歷
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "jobHistory"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            onClick={() => setActiveTab("jobHistory")}
          >
            內部異動
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Content Area */}
          <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-900/50">
            
            {activeTab === "work" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">姓名 (Name) *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">信箱 (Email) *</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">所屬部門 (Department)</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.departmentId || ""}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value ? Number(e.target.value) : undefined })}
                    >
                      <option value="">(無)</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">目前職稱 (Job Title)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.jobTitle || ""}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">底薪 (Base Salary)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.baseSalary || 0}
                      onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">入職日 (Hire Date) *</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.hireDate || ""}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">狀態 (Status)</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.status || 1}
                      onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) as 1 | 2 | 3 })}
                    >
                      <option value={1}>在職 (Active)</option>
                      <option value={2}>留職停薪 (On Leave)</option>
                      <option value={3}>離職 (Terminated)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "personal" && (
              <div className="space-y-6">
                
                {/* 聯絡方式 */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">聯絡方式</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">手機 (Mobile)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.mobile || ""}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">市話 (Phone)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">LINE ID</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.lineId || ""}
                        onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">戶籍地址 (Registered Address)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.registeredAddress || ""}
                        onChange={(e) => setFormData({ ...formData, registeredAddress: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">聯絡地址 (Contact Address)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.contactAddress || ""}
                        onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 個人資料 */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">個人資料</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">生日 (Date of Birth)</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.dateOfBirth || ""}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-sm border border-slate-200 dark:border-slate-700 min-w-[120px] text-center">
                          {age} • {zodiac}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">血型 (Blood Type)</label>
                      <select
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.bloodType || ""}
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      >
                        <option value="">(未設定)</option>
                        <option value="A">A 型</option>
                        <option value="B">B 型</option>
                        <option value="O">O 型</option>
                        <option value="AB">AB 型</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 緊急聯絡人 */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">緊急聯絡人 (Emergency Contact)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">姓名</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.emergencyContactName || ""}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">電話/手機</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.emergencyContactPhone || ""}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "education" && (
              <div className="space-y-4">
                {formData.educations?.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">學校名稱 *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={edu.schoolName}
                          onChange={(e) => handleUpdateEducation(idx, "schoolName", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">學位 (如: 學士)</label>
                          <input
                            type="text"
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={edu.degree || ""}
                            onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">科系</label>
                          <input
                            type="text"
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={edu.major || ""}
                            onChange={(e) => handleUpdateEducation(idx, "major", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">入學日期 *</label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={edu.startDate ? edu.startDate.split('T')[0] : ""}
                          onChange={(e) => handleUpdateEducation(idx, "startDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">畢業日期</label>
                        <input
                          type="date"
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={edu.endDate ? edu.endDate.split('T')[0] : ""}
                          onChange={(e) => handleUpdateEducation(idx, "endDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-sm text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  新增最高學歷
                </button>
              </div>
            )}

            {activeTab === "experience" && (
              <div className="space-y-4">
                {formData.experiences?.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">公司名稱 *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={exp.companyName}
                          onChange={(e) => handleUpdateExperience(idx, "companyName", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">職稱 *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={exp.jobTitle}
                          onChange={(e) => handleUpdateExperience(idx, "jobTitle", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">到職日 *</label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={exp.startDate ? exp.startDate.split('T')[0] : ""}
                          onChange={(e) => handleUpdateExperience(idx, "startDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">離職日 (若仍在職則留空)</label>
                        <input
                          type="date"
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={exp.endDate ? exp.endDate.split('T')[0] : ""}
                          onChange={(e) => handleUpdateExperience(idx, "endDate", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">工作描述</label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={exp.description || ""}
                        onChange={(e) => handleUpdateExperience(idx, "description", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-sm text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  新增過往經歷
                </button>
              </div>
            )}

            {activeTab === "jobHistory" && (
              <div className="space-y-4">
                {formData.jobHistories?.map((jh, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-sm relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveJobHistory(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">任職部門</label>
                        <select
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={jh.departmentId || ""}
                          onChange={(e) => handleUpdateJobHistory(idx, "departmentId", e.target.value ? Number(e.target.value) : undefined)}
                        >
                          <option value="">(無)</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">職稱 *</label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={jh.jobTitle}
                          onChange={(e) => handleUpdateJobHistory(idx, "jobTitle", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">起始日 *</label>
                        <input
                          type="date"
                          required
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={jh.startDate ? jh.startDate.split('T')[0] : ""}
                          onChange={(e) => handleUpdateJobHistory(idx, "startDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">結束日 (若為現職則留空)</label>
                        <input
                          type="date"
                          className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={jh.endDate ? jh.endDate.split('T')[0] : ""}
                          onChange={(e) => handleUpdateJobHistory(idx, "endDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddJobHistory}
                  className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-sm text-slate-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  新增內部異動紀錄
                </button>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  儲存中...
                </>
              ) : "儲存設定"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
