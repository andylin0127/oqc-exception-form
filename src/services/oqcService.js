// 最小抽象層：只負責「環境判斷 + 轉接」
// 網站模式：localStorage（依日期分 key）
// Electron 模式：透過 preload IPC 寫/讀 CSV

function isElectron() {
  return typeof window !== "undefined" && !!window.native;
}

/** 依日期讀回所有紀錄（若不存在，回空陣列） */
export async function readOqcByDate(dateStr) {
  if (isElectron()) {
    const { rows } = await window.native.readOqc(dateStr);
    return rows;
  } else {
    const key = `oqc:${dateStr}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
}

export async function showMessage(opts = {}) {
  if (isElectron()) {
    try {
      // window.native.showMsg 會回傳一個 Promise（ipc invoke）
      return await window.native.showMsg(opts);
    } catch (err) {
      // 如果 ipc 失敗，退回到 browser 的 alert 作為 fallback
      console.error("native.showMsg failed:", err);
      if (opts.message) alert(opts.message);
      return { fallback: true };
    }
  } else {
    // Web / 開發環境：你可以改成 toast，這裡簡單使用 alert
    if (opts.message) alert(opts.message);
    return { fallback: true };
  }
}

/** 追加一筆紀錄到該日期檔 */
export async function saveOqc(record) {
  if (isElectron()) {
    return window.native.saveOqc(record); // 交給 IPC
  } else {
    const key = `oqc:${record.date}`;
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push(record);
    localStorage.setItem(key, JSON.stringify(list));
    return { file: `localStorage:${key}` };
  }
}
