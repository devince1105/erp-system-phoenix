import * as XLSX from "xlsx";

/**
 * 將 JSON 資料匯出為 Excel 檔案 (.xlsx)
 * @param data 要匯出的陣列資料 (JSON Array)
 * @param filename 匯出檔案名稱 (不含副檔名)
 */
export const exportToExcel = (data: Record<string, unknown>[], filename: string = "export") => {
  if (!data || data.length === 0) {
    alert("沒有可匯出的資料");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // 自動調整欄寬 (簡單實作)
  const colWidths = Object.keys(data[0]).map(() => ({ wch: 15 }));
  worksheet["!cols"] = colWidths;

  // 使用 xlsx 內建的 writeFile 處理二進位檔案下載，避免產生不正確的格式
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * 觸發瀏覽器原生的列印功能以匯出 PDF
 * @param title 可選：在列印前暫時修改網頁標題，讓匯出的 PDF 檔名更好看
 */
export const exportToPDF = (title?: string) => {
  const originalTitle = document.title;
  
  if (title) {
    document.title = title;
  }
  
  // 觸發列印
  window.print();
  
  // 復原標題
  if (title) {
    document.title = originalTitle;
  }
};
