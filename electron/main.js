import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;
let win;

// ---- CSV 工具 ----
function escCSV(s) {
  const str = String(s ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}
function csvHeader() {
  return "date,station,product,ngItems,total,remark,createdAt\n";
}
function toRow(r) {
  const ngItems = (r.items || [])
    .map((it) => `${it.name}:${it.count}`)
    .join("|");
  return (
    [r.date, r.station, r.product, ngItems, r.total, r.remark, r.createdAt]
      .map(escCSV)
      .join(",") + "\n"
  );
}
function ymd(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const y = d.getFullYear(),
    m = String(d.getMonth() + 1).padStart(2, "0"),
    dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function filePathByDate(dateStr) {
  const dir = path.join(app.getPath("userData"), "oqc_csv");
  const file = path.join(dir, `${ymd(dateStr)}.csv`);
  return { dir, file };
}
async function ensureFile(file) {
  const dir = path.dirname(file);
  if (!existsSync(dir)) await fs.mkdir(dir, { recursive: true });
  if (!existsSync(file)) await fs.writeFile(file, csvHeader(), "utf-8");
}
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = [];
    let cur = "";
    let q = false;
    for (let k = 0; k < line.length; k++) {
      const ch = line[k];
      if (q) {
        if (ch === '"' && line[k + 1] === '"') {
          cur += '"';
          k++;
        } else if (ch === '"') {
          q = false;
        } else cur += ch;
      } else {
        if (ch === '"') q = true;
        else if (ch === ",") {
          cols.push(cur);
          cur = "";
        } else cur += ch;
      }
    }
    cols.push(cur);
    const [date, station, product, ngItems, total, remark, createdAt] = cols;
    const items = String(ngItems || "")
      .split("|")
      .filter(Boolean)
      .map((s) => {
        const [name, count] = s.split(":");
        return { name, count: Number(count || 0) };
      });
    out.push({
      date,
      station,
      product,
      items,
      total: Number(total || 0),
      remark,
      createdAt,
    });
  }
  return out;
}

// ---- 視窗 ----
async function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 720,
    show: false,
    backgroundColor: "#111827",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
      sandbox: false,
    },
  });
  win.once("ready-to-show", () => win.show());

  if (isDev) {
    await win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexHtml = path.join(__dirname, "..", "dist", "index.html");
    await win.loadFile(indexHtml);
  }
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---- IPC ----
ipcMain.handle("native:read-oqc", async (_e, dateStr) => {
  const { file } = filePathByDate(dateStr);
  try {
    const txt = await fs.readFile(file, "utf-8");
    return { file, rows: parseCsv(txt) };
  } catch {
    return { file, rows: [] }; // 不存在就空
  }
});
ipcMain.handle("native:save-oqc", async (_e, record) => {
  const { file } = filePathByDate(record.date);
  await ensureFile(file);
  await fs.appendFile(file, toRow(record), "utf-8"); // ✅ 同一天同一檔 append
  return { file };
});
