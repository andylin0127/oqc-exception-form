import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import { readOqcByDate, saveOqc } from './services/oqcService';

// const NG_OPTIONS = ['阻焊偏移', '孔銅不足', '表面刮傷', '立碑', '短路', '開路'];

function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function App() {
  const [form, setForm] = useState({
    date: todayYYYYMMDD(),
    station: '',
    qa: '',
    product: '',
    code: '',
    ngCounts: '',
    totalpieces:'',
    array:'',
    pieces:'',
    mrb:'',
    dc:'',
    lc:'',
    remark: '',
  });

  const [recordsOfDay, setRecordsOfDay] = useState([]);



  //架接API連結IPC
  useEffect(() => {
    readOqcByDate(form.date)
      .then(setRecordsOfDay)
      .catch(() => setRecordsOfDay([]));
  }, [form.date]);

  async function save() {
if([
  { key: "station", msg: "請選擇 工作站 / workstation" },
  { key: "qa", msg: "請輸入 QA 人員代碼 / QA STAMP" },
  { key: "product", msg: "請輸入 產品型號 / Product number" },
  { key: "code", msg: "請輸入 異常代碼 / NG code" },
  { key: "ngCounts", msg: "請輸入 NG 數量 / NG quantity" },
  { key: "totalpieces", msg: "請輸入 總片數 / Total pieces" },
  { key: "array", msg: "請輸入 合格片數 / OK array" },
  { key: "pieces", msg: "請輸入 每片 pieces 數 / pieces of array" },
  { key: "mrb", msg: "請輸入 重判數量 / MRB quantity" },
  { key: "dc", msg: "請輸入 D/C " },
  { key: "lc", msg: "請輸入 L/C " },
].some(({ key, msg }) => {
  if (!form[key]?.trim()) {
    alert(msg);
    return true; // 中斷
  }
})){
  return
}

    const record = {
      date: form.date,
      station: form.station,
      qa: form.qa,
      product: form.product.trim(),
      code: form.code,
      ngCounts: form.ngCounts,
      totalpieces:form.totalpieces,
      array:form.array,
      pieces:form.pieces,
      mrb:form.mrb,
      dc:form.dc,
      lc:form.lc,
      remark: form.remark,
      createdAt: new Date().toISOString(),
    };
    try {
      await saveOqc(record); // service：網站 or Electron
      setRecordsOfDay(await readOqcByDate(form.date)); // 重新讀回顯示
      alert('已儲存');
    } catch (err) {
      console.error(err);
      alert('儲存失敗：' + err.message);
    }
    setForm({
    date: todayYYYYMMDD(),
    qa: '',
    station:'',
    product: '',
    code: '',
    ngCounts: '',
    totalpieces:'',
    array:'',
    pieces:'',
    mrb:'',
    dc:'',
    lc:'',
    remark: '',
  });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-neutral-900 text-neutral-100 border-b border-neutral-800">
        <div className="mx-auto max-w-screen-lg px-4 md:px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="font-semibold tracking-wide">OQC 異常紀錄</div>
          <div className="text-xs opacity-75">按日期分類、同日同檔</div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-lg px-4 md:px-6 lg:px-8 py-6 space-y-6">
        <div className='text-center rounded-2xl bg-neutral-900 text-white'> 可透過 TAB 鍵，快速轉換並輸入！</div>
        <section className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm mb-1">日期 / DATE</div>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="text-sm mb-1">工作站 / workstation</div>
                <select
                  value={form.station}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, station: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                >
                  <option value="" disabled hidden>請選擇站點</option>
                  <option value="VRS-1Q">VRS-1Q</option>
                  <option value="FQC-2Q">FQC-2Q</option>
                </select>
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm mb-1">QA 人員 / QA STAMP</div>
                <input
                  placeholder="例如/EX：CK"
                  value={form.qa}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, qa: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="text-sm mb-1">產品料號 / Product number</div>
                <input
                  placeholder="例如/EX：PCB-ABC-123"
                  value={form.product}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, product: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm mb-1">NG 代碼 / NG code</div>
                <input
                  placeholder="例如/EX：7012"
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="text-sm mb-1">NG 數量 / NG quantity</div>
                <input
                  placeholder="例如/EX：123"
                  value={form.ngCounts}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ngCounts: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="block">
                <div className="text-sm mb-1">總片數 / Total pieces</div>
                <input
                  placeholder="例如/EX：100"
                  value={form.totalpieces}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, totalpieces: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="text-sm mb-1">合格片數 / OK array</div>
                <input
                  placeholder="例如/EX：50"
                  value={form.array}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, array: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
              
              <label className="block">
                <div className="text-sm mb-1">每片數量 / pieces per array</div>
                <input
                  placeholder="例如/EX：5"
                  value={form.pieces}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pieces: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="block">
                <div className="text-sm mb-1">重工數 / MRB pieces</div>
                <input
                  placeholder="例如/EX：16"
                  value={form.mrb}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, mrb: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="text-sm mb-1"> D / C </div>
                <input
                  placeholder="例如/EX：2533262"
                  value={form.dc}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dc: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
              
              <label className="block">
                <div className="text-sm mb-1"> L / C </div>
                <input
                  placeholder="例如/EX：262"
                  value={form.lc}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lc: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
            </div>
            <label className="block">
              <div className="text-sm mb-1">備註</div>
              <textarea
                rows={3}
                value={form.remark}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remark: e.target.value }))
                }
                className="w-full border rounded-xl px-3 py-2"
              />
            </label>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={save}
                  className="border rounded-xl px-3 py-2 bg-neutral-900 text-white hover:text-neutral-900 hover:bg-white"
                >
                  儲存紀錄
                </button>
              </div>
            </div>
          </div>
        </section>
        <section>
          <aside className="bg-white rounded-2xl shadow p-4">
            <div className="text-sm font-medium mb-2">
              當日紀錄（{recordsOfDay.length} 筆）
            </div>
            <div className="text-xs max-h-56 overflow-auto border rounded-xl">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-neutral-100">
                  <tr>
                    <th className="p-2">序號</th>
                    <th className="p-2">時間</th>
                    <th className="p-2">產品</th>
                    <th className="p-2">QA人員</th>
                    <th className="p-2">產品型號</th>
                    <th className="p-2">異常代碼</th>
                    <th className="p-2">異常數量</th>
                    <th className="p-2">總片數</th>
                    <th className="p-2">合格片數</th>
                    <th className="p-2">每片數量</th>
                    <th className="p-2">重工數</th>
                    <th className="p-2">D / C</th>
                    <th className="p-2">L / C</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsOfDay.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{i+1}</td>
                      <td className="p-2 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="p-2">{r.station}</td>
                      <td className="p-2">{r.qa}</td>
                      <td className="p-2">{r.product}</td>
                      <td className="p-2">{r.code}</td>
                      <td className="p-2">{r.ngCounts}</td>
                      <td className="p-2">{r.totalpieces}</td>
                      <td className="p-2">{r.array}</td>
                      <td className="p-2">{r.pieces}</td>
                      <td className="p-2">{r.mrb}</td>
                      <td className="p-2">{r.dc}</td>
                      <td className="p-2">{r.lc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
