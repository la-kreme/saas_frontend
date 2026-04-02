import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, startOfWeek, endOfMonth, endOfWeek, isSameMonth, isSameDay, parseISO, addDays, isBefore, startOfDay } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface WidgetAppProps {
  restaurantId: string;
  lang: string;
}

const API_BASE = 'http://localhost:8000'; // For dev, or fallback. In prod we should build with correct URL or use absolute URL if configured.
// Since it's a web component on the restau site, we MUST hardcode the API URL or take it from attribute.
// Let's use relative if it's served from the same domain, or pass an attribute.
// For now, let's assume the widget script is loaded from the backend or has process.env.VITE_API_BASE.

const t = {
  fr: {
    loading: "Chargement...",
    error: "Erreur lors du chargement.",
    guests: "Personnes",
    selectDate: "Choisissez une date",
    slotsFor: "Créneaux pour le",
    noSlots: "Aucun créneau disponible",
    details: "Vos coordonnées",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    confirm: "Confirmer la réservation",
    success: "Réservation confirmée !",
    back: "Retour",
    powebBy: "Propulsé par"
  },
  en: {
    loading: "Loading...",
    error: "Error loading config.",
    guests: "Guests",
    selectDate: "Pick a date",
    slotsFor: "Slots for",
    noSlots: "No slots available",
    details: "Your details",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    confirm: "Confirm reservation",
    success: "Reservation confirmed!",
    back: "Back",
    powebBy: "Powered by"
  }
};

export default function WidgetApp({ restaurantId, lang }: WidgetAppProps) {
  const isEn = lang === 'en';
  const txt = isEn ? t.en : t.fr;
  const dateLocale = isEn ? enUS : fr;

  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorStr, setErrorStr] = useState('');

  // State machine: 'calendar' -> 'slots' -> 'form' -> 'success'
  const [step, setStep] = useState<'calendar' | 'slots' | 'form' | 'success'>('calendar');

  const [guests, setGuests] = useState(2);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [monthAvail, setMonthAvail] = useState<{ [date: string]: boolean }>({});
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [lockToken, setLockToken] = useState<string | null>(null);
  const [submitLoad, setSubmitLoad] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [restaurantId]);

  useEffect(() => {
    if (config) fetchAvailability();
  }, [currentMonth, guests, config]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/widget/${restaurantId}/config?lang=${lang}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConfig(data);
      // Set CSS variable
      document.body.style.setProperty('--lk-accent', data.accent_color);
    } catch (e) {
      setErrorStr(txt.error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const mStr = format(currentMonth, 'yyyy-MM');
      const res = await fetch(`${API_BASE}/api/v1/widget/${restaurantId}/availability?month=${mStr}&guests=${guests}`);
      if (res.ok) {
        const data = await res.json();
        const availMap: Record<string, boolean> = {};
        data.dates.forEach((d: any) => availMap[d.date] = d.available);
        setMonthAvail(availMap);
      }
    } catch (e) { }
  };

  const fetchSlots = async (date: Date) => {
    setStep('slots');
    setLoading(true);
    setSelectedDate(date);
    try {
      const dStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`${API_BASE}/api/v1/widget/${restaurantId}/slots?date=${dStr}&guests=${guests}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const pickSlot = async (slot: any) => {
    setSelectedSlot(slot);
    setStep('form');
    // Lock slot
    try {
      const lockRes = await fetch(`${API_BASE}/api/v1/widget/${restaurantId}/reservations/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: format(selectedDate!, 'yyyy-MM-dd'),
          time: slot.time,
          guests
        })
      });
      if (lockRes.ok) {
        const lockData = await lockRes.json();
        setLockToken(lockData.lock_token);
      } else {
        alert("Ce créneau n'est plus disponible.");
        setStep('slots');
      }
    } catch {
      setStep('slots');
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoad(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/widget/${restaurantId}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lock_token: lockToken,
          guest_first_name: form.firstName,
          guest_last_name: form.lastName,
          guest_email: form.email,
          guest_phone: form.phone,
          lang
        })
      });
      if (res.ok) {
        setStep('success');
      } else {
        alert("Erreur lors de la réservation.");
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setSubmitLoad(false);
    }
  };

  if (loading && !config) return <div className="lk-widget"><div className="lk-loader"></div> {txt.loading}</div>;
  if (errorStr) return <div className="lk-widget">{errorStr}</div>;
  if (!config.is_active) return <div className="lk-widget">Ce widget est désactivé.</div>;

  // Calendar render logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const today = startOfDay(new Date());
  
  return (
    <div className="lk-widget" style={{ '--lk-accent': config.accent_color } as any}>
      <div className="lk-header">
        <h2 className="lk-title">{config.welcome_message || txt.selectDate}</h2>
        {config.restaurant_name && <p className="lk-subtitle">{config.restaurant_name}</p>}
      </div>

      {step === 'calendar' && (
        <div className="animate-fade-in">
          <div className="lk-form-group">
            <label className="lk-label">{txt.guests}</label>
            <select className="lk-input" value={guests} onChange={e => setGuests(Number(e.target.value))}>
              {Array.from({ length: config.max_party_size || 10 }).map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>

          <div className="lk-calendar-header">
            <button className="lk-btn" style={{ width: 'auto', padding: '6px 12px' }} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&lt;</button>
            <span style={{ fontWeight: 600 }}>{format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}</span>
            <button className="lk-btn" style={{ width: 'auto', padding: '6px 12px' }} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&gt;</button>
          </div>

          <div className="lk-calendar-grid">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i} className="lk-day-name">{d}</div>)}
            {days.map((d, i) => {
              const dStr = format(d, 'yyyy-MM-dd');
              const isPast = isBefore(d, today);
              const avail = monthAvail[dStr];
              const disabled = isPast || !isSameMonth(d, monthStart) || !avail;
              
              return (
                <button
                  key={i}
                  disabled={disabled}
                  className={`lk-day-btn`}
                  onClick={() => fetchSlots(d)}
                >
                  {format(d, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 'slots' && (
        <div className="animate-fade-in">
          <button className="lk-btn" style={{ background: 'transparent', color: '#666', border: '1px solid #ddd', marginBottom: '16px' }} onClick={() => setStep('calendar')}>&larr; {txt.back}</button>
          <div className="lk-label" style={{ textAlign: 'center' }}>
            {txt.slotsFor} {format(selectedDate!, 'dd MMMM yyyy', { locale: dateLocale })}
          </div>
          
          {loading ? (
             <div style={{ textAlign: 'center', padding: '20px' }}>{txt.loading}</div>
          ) : (
            <div className="lk-slots">
              {slots.map((s, i) => (
                <button
                  key={i}
                  className="lk-slot-btn"
                  disabled={!s.available}
                  style={{ opacity: s.available ? 1 : 0.5 }}
                  onClick={() => pickSlot(s)}
                >
                  {s.time}
                </button>
              ))}
              {slots.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#666' }}>{txt.noSlots}</div>}
            </div>
          )}
        </div>
      )}

      {step === 'form' && (
        <div className="animate-fade-in">
          <button className="lk-btn" style={{ background: 'transparent', color: '#666', border: '1px solid #ddd', marginBottom: '16px' }} onClick={() => setStep('slots')}>&larr; {txt.back}</button>
          <form onSubmit={submitForm}>
            <div className="lk-form-group">
              <label className="lk-label">{txt.firstName}</label>
              <input required className="lk-input" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div className="lk-form-group">
              <label className="lk-label">{txt.lastName}</label>
              <input required className="lk-input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
            <div className="lk-form-group">
              <label className="lk-label">{txt.email}</label>
              <input required type="email" className="lk-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="lk-form-group">
              <label className="lk-label">{txt.phone}</label>
              <input required type="tel" className="lk-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <button className="lk-btn" type="submit" disabled={submitLoad || !lockToken}>
              {submitLoad && <span className="lk-loader" />} {txt.confirm}
            </button>
          </form>
        </div>
      )}

      {step === 'success' && (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h3 style={{ margin: '0 0 8px 0' }}>{txt.success}</h3>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Un email de confirmation vous a été envoyé.</p>
        </div>
      )}

      {config.show_branding && (
        <div className="lk-branding">
          {txt.powebBy} <a href="https://lakreme.fr" target="_blank">La Krème</a>
        </div>
      )}
    </div>
  );
}
