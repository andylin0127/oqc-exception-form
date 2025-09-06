import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
// import { readOqcByDate, saveOqc } from './services/oqcService';

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
    station: 'FQC-2Q',
    qa: '',
    product: '',
    code: '',
    counts: '',
    remark: '',
  });
  const [customNG, setCustomNG] = useState('');
  const [recordsOfDay, setRecordsOfDay] = useState([]);

  const totalNG = useMemo(
    () => Object.values(form.counts).reduce((a, b) => a + (Number(b) || 0), 0),
    [form.counts]
  );

  // 架接API連結IPC
  // useEffect(() => {
  //   readOqcByDate(form.date)
  //     .then(setRecordsOfDay)
  //     .catch(() => setRecordsOfDay([]));
  // }, [form.date]);

  async function save() {
    if (!form.product.trim()) {
      alert('請輸入產品型號');
      return;
    }
    const record = {
      date: form.date,
      station: form.station,
      qa: form.qa,
      product: form.product.trim(),
      code: form.code,
      count: Number(form.counts[name] || 0),
      total: totalNG,
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
        <section className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm mb-1">日期</div>
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
                <div className="text-sm mb-1">站點</div>
                <select
                  value={form.station}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, station: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                >
                  <option>FQC-2Q</option>
                  <option>VRS-1Q</option>
                </select>
              </label>
              <label className="block">
                <div className="text-sm mb-1">QA 人員 / QA STAMP</div>
                <input
                  placeholder="例如：CK"
                  value={form.qa}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, qa: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
            </div>
            <div>
              <label className="block">
                <div className="text-sm mb-1">產品型號</div>
                <input
                  placeholder="例如：PCB-ABC-123"
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
                <div className="text-sm mb-1">異常代碼</div>
                <input
                  placeholder="例如：7012"
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, code: e.target.value }))
                  }
                  className="w-full border rounded-xl px-3 py-2"
                />
              </label>
              <label className="block">
                <div className="text-sm mb-1">異常數量</div>
                <input
                  placeholder="123"
                  value={form.counts}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, counts: e.target.value }))
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
                  className="border rounded-xl px-3 py-2 bg-neutral-900 text-white"
                >
                  儲存紀錄
                </button>
              </div>
            </div>
          </div>

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
                  </tr>
                </thead>
                <tbody>
                  {recordsOfDay.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{i}</td>
                      <td className="p-2 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="p-2">{r.station}</td>
                      <td className="p-2">{r.qa}</td>
                      <td className="p-2">{r.product}</td>
                      <td className="p-2">{r.code}</td>
                      <td className="p-2">{r.counts}</td>
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
