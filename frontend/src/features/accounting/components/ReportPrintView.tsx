import React from "react";

interface ReportPrintViewProps {
  title: string;
  companyName: string;
  dateString: string;
  children: React.ReactNode;
  hideSignatures?: boolean;
}

export const ReportPrintView: React.FC<ReportPrintViewProps> = ({
  title,
  companyName,
  dateString,
  children,
  hideSignatures = false
}) => {
  return (
    <div className="hidden print:block print:bg-white print:text-black print:font-serif print:w-[210mm] print:min-h-[297mm] print:mx-auto print:p-8">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-6">
        <h1 className="text-3xl font-bold mb-2">{companyName}</h1>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-base mt-2">{dateString}</p>
        <p className="text-sm mt-1 text-right">列印日期：{new Date().toLocaleDateString()}</p>
      </div>

      {/* Report Body */}
      <div className="mb-12">
        {children}
      </div>

      {/* Signatures */}
      {!hideSignatures && (
        <div className="mt-16 grid grid-cols-3 gap-8 text-center pt-8">
          <div>
            <div className="border-t border-black pt-2 mx-4">
              <p className="font-bold">董事長 / 負責人</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-2 mx-4">
              <p className="font-bold">經理人</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-2 mx-4">
              <p className="font-bold">主辦會計</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
