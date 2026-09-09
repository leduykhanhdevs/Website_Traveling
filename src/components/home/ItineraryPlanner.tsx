import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Download, MapPin, Save, Sparkles, Loader2, ArrowUpRight } from 'lucide-react';
import { DESTINATIONS } from '../../data/destinations';
import { CustomSelect } from '../ui/CustomSelect';
import { planSchema, validateGeneratedPlan, type ItineraryPlan, type ItineraryRequest } from '../../../shared/itinerary';

const STORAGE_KEY = 'traveling:itinerary:v1';
const usd = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'USD' }).format(value);
const styles = ['Văn hóa & Ẩm thực', 'Thiên nhiên & Thám hiểm', 'Nghỉ dưỡng sang trọng', 'Tiết kiệm & Du lịch bụi'];

export function ItineraryPlanner({ destinationId, onDestinationChange }: { destinationId: string; onDestinationChange: (id: string) => void }) {
  const [tripDays, setTripDays] = useState(3);
  const [travelStyle, setTravelStyle] = useState(styles[0]);
  const [budgetRange, setBudgetRange] = useState<ItineraryRequest['budgetRange']>('midrange');
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [day, setDay] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const controller = useRef<AbortController | null>(null);
  const city = DESTINATIONS.find(d => d.id === destinationId) || DESTINATIONS[2];
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    controller.current?.abort(); controller.current = null; setBusy(false); setError(''); setNotice('');
  }, [destinationId, tripDays, travelStyle, budgetRange]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { setPlan(planSchema.parse(JSON.parse(saved))); setNotice('Đã khôi phục lịch lưu trên thiết bị này.'); }
    } catch { setNotice('Không thể khôi phục lịch đã lưu. Bạn có thể tạo lịch mới.'); }
  }, []);

  async function generate() {
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    setBusy(true); setError(''); setNotice('');
    const request: ItineraryRequest = { destination: `${city.name}, ${city.country}`, days: tripDays, travelStyle, budgetRange };
    const timeout = window.setTimeout(() => abort.abort(), 55000);
    try {
      const response = await fetch('/api/itinerary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request), signal: abort.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Không thể kết nối dịch vụ tạo lịch trình. Vui lòng thử lại.');
      let result: ItineraryPlan;
      try { result = validateGeneratedPlan(data?.plan, request); }
      catch { throw new Error('Dữ liệu lịch trình chưa hợp lệ. Hãy thử tạo lại.'); }
      if (controller.current !== abort) return;
      setPlan(result); setDay(1); setNotice(`Đã tạo lịch ${result.days.length} ngày. Bạn có thể lưu hoặc tải lịch bên dưới.`);
    } catch (err) {
      if (controller.current !== abort) return;
      setError(abort.signal.aborted ? 'Đã dừng yêu cầu hoặc hết thời gian chờ. Bạn có thể thử lại.' : err instanceof TypeError ? 'Kết nối bị gián đoạn. Kiểm tra mạng và thử lại.' : err instanceof Error ? err.message : 'Không thể tạo lịch trình.');
    } finally {
      clearTimeout(timeout);
      if (controller.current === abort) { setBusy(false); controller.current = null; }
    }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); setNotice('Đã lưu trên thiết bị này. Lịch chưa đồng bộ vào tài khoản app.'); }
    catch { setError('Trình duyệt không cho phép lưu hoặc đã đầy. Hãy tải tệp lịch trình.'); }
  }
  function download(format: 'json' | 'txt') {
    if (!plan) return;
    const text = format === 'json' ? JSON.stringify(plan, null, 2) : `${plan.destination}\n${plan.days.length} ngày · Chi phí dự kiến: ${usd(plan.totalEstimatedSpend)} / người\nChưa gồm vé máy bay và lưu trú. Kiểm tra giờ mở cửa và giá trước khi đi.\n\n` + plan.days.map(d => `NGÀY ${d.day}: ${d.title}\n${d.slots.map(s => `${s.startTime}–${s.endTime} ${s.title}\n${s.description}\nDự kiến: ${usd(s.estimatedSpend)}`).join('\n\n')}`).join('\n\n');
    const url = URL.createObjectURL(new Blob([text], { type: format === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `traveling-${plan.id}.${format}`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const selectedDay = plan?.days.find(d => d.day === day) || plan?.days[0];
  return <div className="planner p-5 sm:p-8 space-y-6">
    <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles size={16} aria-hidden="true" /> HÀNH TRÌNH CỦA RIÊNG BẠN</div>
    <div className="grid sm:grid-cols-2 gap-4">
      <CustomSelect id="sim-city-select" label="Bạn muốn đi đâu?" value={destinationId} onChange={onDestinationChange} options={DESTINATIONS.map(d => ({ value: d.id, label: d.name, subLabel: d.country }))} />
      <CustomSelect id="sim-style-select" label="Phong cách khám phá" value={travelStyle} onChange={setTravelStyle} options={styles.map(value => ({ value, label: value }))} />
      <CustomSelect id="sim-budget-select" label="Mức chi tiêu" value={budgetRange} onChange={v => setBudgetRange(v as ItineraryRequest['budgetRange'])} options={[{ value: 'budget', label: 'Tiết kiệm' }, { value: 'midrange', label: 'Vừa phải' }, { value: 'premium', label: 'Thoải mái' }]} />
      <div><span id="sim-days-label" className="text-xs font-semibold text-slate-300 mb-1.5 block">Thời gian chuyến đi</span><div role="group" aria-labelledby="sim-days-label" className="flex gap-2">{[1, 3, 5, 7].map(n => <button key={n} onClick={() => setTripDays(n)} aria-pressed={tripDays === n} className={`flex-1 min-h-11 rounded-xl text-sm font-semibold border ${tripDays === n ? 'bg-primary text-slate-950 border-primary' : 'bg-surface-light text-slate-300 border-border-subtle'}`}>{n} ngày</button>)}</div></div>
    </div>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">AI sắp xếp địa điểm và hoạt động theo sở thích của bạn. Tối đa 5 lượt tạo mỗi giờ.</p>
      <button onClick={generate} disabled={busy} className="planner-primary shrink-0">{busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} {busy ? 'Đang tạo lịch trình…' : 'Tạo lịch trình AI'}</button>
    </div>
    <div role="status" aria-live="polite" className="text-sm text-emerald-300">{busy ? 'Đang sắp xếp từng ngày cho chuyến đi của bạn…' : notice}</div>
    {error && <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</div>}
    {!plan && !busy && <div className="planner-empty rounded-2xl overflow-hidden relative min-h-52 flex items-end">
      <img src={city.image} alt={`Khám phá ${city.name}`} width="800" height="400" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
      <div className="relative p-6"><span className="text-xs uppercase tracking-widest text-primary">{city.country}</span><h3 className="text-2xl font-bold text-white mt-2">{tripDays} ngày khám phá {city.name}</h3><p className="text-sm text-slate-300 mt-2">Chọn gu du lịch. Để AI gợi ý điểm dừng tiếp theo.</p></div>
    </div>}
    {plan && selectedDay && <div className="space-y-5" aria-busy={busy}>
      <div className="border-t border-border-subtle pt-6 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl sm:text-2xl text-white font-bold">{plan.destination}</h3><p className="text-sm text-slate-400 mt-2">{plan.days.length} ngày · {plan.days.reduce((n, d) => n + d.slots.length, 0)} hoạt động</p></div><div className="text-right"><span className="text-xs text-slate-400">Chi phí dự kiến / người</span><p className="text-lg text-primary font-bold">{usd(plan.totalEstimatedSpend)}</p></div></div>
      <p className="text-xs text-slate-400 leading-relaxed">Đây là đề xuất do AI tạo, chưa xác minh giờ mở cửa, thời tiết hoặc giá hiện tại. Chi phí bằng USD, chưa gồm vé máy bay và lưu trú. Kết quả bên dưới giữ nguyên cho đến lần tạo thành công tiếp theo.</p>
      <div role="group" aria-label="Chọn ngày trong lịch trình" className="flex gap-2 flex-wrap">{plan.days.map(d => <button key={d.day} aria-pressed={selectedDay.day === d.day} onClick={() => setDay(d.day)} className={`min-h-11 px-4 rounded-xl text-sm flex items-center gap-2 ${selectedDay.day === d.day ? 'bg-primary text-slate-950 font-bold' : 'bg-surface-light text-slate-300'}`}><CalendarDays size={14} />Ngày {d.day}</button>)}</div>
      <div className="rounded-2xl border border-border-subtle bg-surface-light/50 p-4 sm:p-6"><h4 className="font-bold text-white mb-6">{selectedDay.title}</h4><ol className="space-y-6">{selectedDay.slots.map((slot, i) => <li key={slot.id} className="flex gap-3 sm:gap-4"><span className="w-7 h-7 shrink-0 rounded-full border border-primary/30 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-primary font-mono"><span>{slot.startTime} - {slot.endTime}</span><span>{usd(slot.estimatedSpend)}</span></div><h5 className="font-semibold text-sm text-white mt-2">{slot.title}</h5><p className="text-sm text-slate-400 leading-relaxed mt-2">{slot.description}</p><a className="inline-flex items-center gap-1.5 text-xs text-primary mt-3 min-h-8" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${slot.title}, ${plan.destination}`)}`} target="_blank" rel="noopener noreferrer"><MapPin size={13} />Tìm trên bản đồ<ArrowUpRight size={12} /></a></div></li>)}</ol></div>
      <div className="flex flex-wrap gap-3"><button onClick={save} className="planner-secondary"><Save size={16} />Lưu trên thiết bị</button><button onClick={() => download('txt')} className="planner-secondary"><Download size={16} />Tải lịch ngoại tuyến</button><button onClick={() => download('json')} className="planner-secondary"><Download size={16} />Xuất JSON</button></div>
    </div>}
  </div>;
}
