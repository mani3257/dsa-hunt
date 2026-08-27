import { useMemo } from "react";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_MS = 24 * 60 * 60 * 1000;

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function levelFor(count) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export default function StreakCalendar({ days = [], rangeDays = 140 }) {
  const { weeks, monthMarkers } = useMemo(() => {
    const countByDate = new Map(days.map((d) => [d.date, d.count]));

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const rawStart = new Date(today.getTime() - (rangeDays - 1) * DAY_MS);
    // Align to the most recent Sunday on/before rawStart so every column is a full week.
    const start = new Date(rawStart.getTime() - rawStart.getUTCDay() * DAY_MS);

    const totalDays = Math.round((today - start) / DAY_MS) + 1;
    const cells = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start.getTime() + i * DAY_MS);
      const key = toKey(date);
      cells.push({
        key,
        date,
        count: countByDate.get(key) || 0,
        inRange: date >= rawStart,
      });
    }

    const weekCols = [];
    for (let i = 0; i < cells.length; i += 7) {
      weekCols.push(cells.slice(i, i + 7));
    }

    const markers = [];
    let lastMonth = null;
    weekCols.forEach((week, index) => {
      const month = week[0].date.getUTCMonth();
      if (month !== lastMonth) {
        markers.push({ index, label: MONTH_LABELS[month] });
        lastMonth = month;
      }
    });

    return { weeks: weekCols, monthMarkers: markers };
  }, [days, rangeDays]);

  return (
    <div className="streak-calendar">
      <div className="streak-calendar-months">
        {monthMarkers.map((m) => (
          <span key={`${m.label}-${m.index}`} style={{ gridColumnStart: m.index + 1 }}>
            {m.label}
          </span>
        ))}
      </div>

      <div className="streak-calendar-grid">
        {weeks.map((week, i) => (
          <div className="streak-calendar-col" key={i}>
            {week.map((cell) => (
              <div
                key={cell.key}
                className={`streak-cell level-${cell.inRange ? levelFor(cell.count) : "muted"}`}
                title={`${cell.date.toDateString()} — ${cell.count} solved`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="streak-calendar-legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className={`streak-cell level-${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
