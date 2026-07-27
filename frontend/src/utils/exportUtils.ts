import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * 將 JSON 資料匯出為 Excel 檔案 (.xlsx)
 * @param data 要匯出的陣列資料 (JSON Array)
 * @param filename 匯出檔案名稱 (不含副檔名)
 */
export const exportToExcel = (data: any[], filename: string = "export") => {
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

// Global cache for the font base64 string to avoid fetching it multiple times
let cachedFontBase64: string | null = null;

const getFontBase64 = async (): Promise<string> => {
  if (cachedFontBase64) return cachedFontBase64;
  
  try {
    // 透過 fetch 從 public/fonts 取得中文字型檔
    const response = await fetch('/fonts/NotoSansTC-Regular.ttf');
    const buffer = await response.arrayBuffer();
    
    // Convert ArrayBuffer to Base64
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    // 分批處理避免 Maximum call stack size exceeded
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    cachedFontBase64 = window.btoa(binary);
    return cachedFontBase64;
  } catch (error) {
    console.error("載入中文字型失敗:", error);
    throw new Error("無法載入中文字型，請確認字型檔路徑。");
  }
};

/**
 * 使用 jsPDF 匯出 PDF 檔案 (包含中文支援與表格繪製)
 * @param filename 匯出檔案名稱 (不含副檔名)
 * @param title PDF 文件標題
 * @param headers 表格標題陣列 (例如: ["姓名", "信箱", ...])
 * @param data 表格內容陣列，必須是 Array of Arrays (例如: [["王小明", "a@a.com"], ...])
 */
export const exportToPDF = async (
  filename: string,
  title: string,
  headers: string[],
  data: any[][]
) => {
  if (!data || data.length === 0) {
    alert("沒有可匯出的資料");
    return;
  }

  try {
    // 建立 jsPDF 實體，設定為 A4 大小
    const doc = new jsPDF();
    
    // 載入並註冊中文字型
    const fontBase64 = await getFontBase64();
    doc.addFileToVFS("NotoSansTC-Regular.ttf", fontBase64);
    doc.addFont("NotoSansTC-Regular.ttf", "NotoSansTC", "normal");
    
    // 設定預設字型為中文字型，避免亂碼
    doc.setFont("NotoSansTC");

    // 繪製標題
    doc.setFontSize(18);
    // 置中標題 (A4 寬度為 210mm，中心為 105mm)
    doc.text(title, 105, 15, { align: "center" });
    
    // 繪製列印日期
    doc.setFontSize(10);
    doc.setTextColor(100);
    const printDate = new Date().toLocaleDateString('zh-TW');
    doc.text(`列印日期: ${printDate}`, 195, 25, { align: "right" });

    // 使用 autoTable 繪製資料表格
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 30, // 距離上方邊界 30mm
      styles: {
        font: "NotoSansTC", // 套用中文字型到表格
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue-500
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Slate-50
      },
      margin: { top: 30, right: 15, bottom: 20, left: 15 },
    });

    // 儲存 PDF 檔案
    doc.save(`${filename}.pdf`);
    
  } catch (error) {
    console.error("PDF 匯出失敗:", error);
    alert("匯出 PDF 時發生錯誤，請稍後再試。");
  }
};
