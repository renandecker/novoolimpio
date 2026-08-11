export interface ScheduleEventData {
  id?: string | number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  styleClass?: string;
  ocorrenciaId?: number | null;
}

export interface LegendaItem {
  className: string;
  label: string;
}

interface WeeklyGridProps {
  events: ScheduleEventData[];
  startDate: string;
  minTime?: string;
  maxTime?: string;
  dayLabels?: string[];
  onEventClick?: (event: ScheduleEventData) => void;
}

const ROW_H = 30;
const SLOT = 30;
const DIA_NOME = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  r.setDate(r.getDate() + days);
  return r;
}

export function mondayOf(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  const dow = (r.getDay() + 6) % 7;
  return addDays(r, -dow);
}

export function fmtData(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function fmtDataLong(d: Date): string {
  return `${fmtData(d)}/${d.getFullYear()}`;
}

function parseEventTime(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function sameDay(d: Date | null, day: Date): boolean {
  if (!d) return false;
  return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
}

function computeBounds(
  events: ScheduleEventData[],
  minTime?: string,
  maxTime?: string,
): { lo: number; hi: number } {
  const mins: number[] = [];
  const maxs: number[] = [];
  for (const e of events) {
    if (e.allDay) continue;
    const s = parseEventTime(e.start);
    const en = parseEventTime(e.end);
    if (s) mins.push(s.getHours() * 60 + s.getMinutes());
    if (en) maxs.push(en.getHours() * 60 + en.getMinutes());
  }
  let lo = minTime ? toMinutes(minTime) : mins.length ? Math.floor(Math.min(...mins) / SLOT) * SLOT : 7 * 60;
  let hi = maxTime ? toMinutes(maxTime) : maxs.length ? Math.ceil(Math.max(...maxs) / SLOT) * SLOT : 22 * 60;
  if (hi <= lo) hi = lo + 60;
  return { lo, hi };
}

export function WeeklyGrid({ events, startDate, minTime, maxTime, dayLabels, onEventClick }: WeeklyGridProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(parseDate(startDate), i));
  const bounds = computeBounds(events, minTime, maxTime);
  const rows = Math.round((bounds.hi - bounds.lo) / SLOT);
  const bodyHeight = rows * ROW_H;
  const todayIso = toIsoDate(new Date());

  const allDayEvents = events.filter((e) => e.allDay);
  const timedEvents = events.filter((e) => !e.allDay);

  return (
    <div className="wg">
      <div className="wg-grid">
        <div className="wg-corner wg-corner-titulo">Hora</div>
        {days.map((d, i) => (
          <div key={`h${i}`} className={`wg-header-day${toIsoDate(d) === todayIso ? ' wg-header-hoje' : ''}`}>
            <span className="wg-dia-nome">{dayLabels?.[i] ?? DIA_NOME[(d.getDay() + 6) % 7]}</span>
            <span className="wg-dia-data">{fmtDataLong(d)}</span>
          </div>
        ))}

        <div className="wg-corner wg-corner-all-day">Dia inteiro</div>
        {days.map((d, i) => (
          <div key={`a${i}`} className="wg-all-day">
            {allDayEvents
              .filter((e) => sameDay(parseEventTime(e.start), d))
              .map((e, j) => (
                <div
                  key={j}
                  className={`wg-all-day-event ${e.styleClass ?? ''}`}
                  title={e.title}
                  onClick={() => onEventClick?.(e)}
                >
                  {e.title}
                </div>
              ))}
          </div>
        ))}

        <div className="wg-gutter" style={{ height: bodyHeight }}>
          {Array.from({ length: rows }, (_, r) => {
            const t = bounds.lo + r * SLOT;
            return (
              <div key={r} className="wg-gutter-row" style={{ height: ROW_H }}>
                {t % 60 === 0 && <span className="wg-gutter-hora">{String(Math.floor(t / 60)).padStart(2, '0')}:00</span>}
              </div>
            );
          })}
        </div>

        {days.map((d, i) => {
          const dayEvents = timedEvents.filter((e) => sameDay(parseEventTime(e.start), d));
          return (
            <div key={`b${i}`} className="wg-col" style={{ height: bodyHeight }}>
              {Array.from({ length: rows }, (_, r) => (
                <div key={r} className="wg-row" style={{ height: ROW_H }} />
              ))}
              {dayEvents.map((e, j) => {
                const s = parseEventTime(e.start);
                const en = parseEventTime(e.end);
                if (!s) return null;
                const smin = s.getHours() * 60 + s.getMinutes();
                const emin = en ? en.getHours() * 60 + en.getMinutes() : smin + SLOT;
                let top = ((smin - bounds.lo) / SLOT) * ROW_H;
                let height = ((Math.max(emin, smin + SLOT) - smin) / SLOT) * ROW_H;
                if (top < 0) {
                  height += top;
                  top = 0;
                }
                if (height < 14) height = 14;
                return (
                  <div
                    key={j}
                    className={`wg-event ${e.styleClass ?? ''}`}
                    style={{ top, height }}
                    title={e.title}
                    onClick={() => onEventClick?.(e)}
                  >
                    <span className="wg-event-text">{e.title}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ScheduleWeekViewProps {
  startDate: string;
  onWeekChange: (startDate: string) => void;
  events: ScheduleEventData[];
  loading?: boolean;
  error?: string | null;
  legend?: LegendaItem[];
  onEventClick?: (event: ScheduleEventData) => void;
  minTime?: string;
  maxTime?: string;
}

export function ScheduleWeekView({
  startDate,
  onWeekChange,
  events,
  loading,
  error,
  legend,
  onEventClick,
  minTime,
  maxTime,
}: ScheduleWeekViewProps) {
  const fim = toIsoDate(addDays(parseDate(startDate), 6));
  return (
    <div className="disp-semana">
      <div className="disp-controles">
        <button
          type="button"
          className="disp-btn"
          onClick={() => onWeekChange(toIsoDate(addDays(parseDate(startDate), -7)))}
        >
          ‹ Anterior
        </button>
        <button type="button" className="disp-btn" onClick={() => onWeekChange(toIsoDate(mondayOf(new Date())))}>
          Hoje
        </button>
        <button
          type="button"
          className="disp-btn"
          onClick={() => onWeekChange(toIsoDate(addDays(parseDate(startDate), 7)))}
        >
          Próximo ›
        </button>
        <span className="disp-periodo">
          {fmtDataLong(parseDate(startDate))} – {fmtDataLong(parseDate(fim))}
        </span>
      </div>
      {legend && legend.length > 0 && (
        <div className="disp-legenda">
          {legend.map((l) => (
            <span key={l.className} className="disp-legenda-item">
              <span className={`disp-dot ${l.className}`} /> {l.label}
            </span>
          ))}
        </div>
      )}
      {loading && <div className="disp-carregando">Carregando agenda...</div>}
      {error && <div className="disp-erro">{error}</div>}
      <WeeklyGrid startDate={startDate} events={events} minTime={minTime} maxTime={maxTime} onEventClick={onEventClick} />
    </div>
  );
}
