import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import type { Habit, ChartPoint, HistoryEntry } from "../types";
import { useLang } from "../i18n";

interface StatsViewProps {
  habit: Habit;
  onBack: () => void;
}

function buildChartData(habit: Habit): ChartPoint[] {
  if (habit.history.length === 0) return [];

  const sorted = [...habit.history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let streak = 0;
  return sorted.map((entry) => {
    if (entry.type === "relapse") {
      streak = 0;
    } else {
      streak++;
    }
    return {
      label: new Date(entry.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      streak,
      isRelapse: entry.type === "relapse",
    };
  });
}

function getCssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function useChartColors() {
  const { theme } = useLang();
  return useMemo(
    () => ({
      grid: getCssVar("--chart-grid"),
      axis: getCssVar("--chart-axis"),
      tooltipBg: getCssVar("--chart-tooltip-bg"),
      tooltipBorder: getCssVar("--chart-tooltip-border"),
      tooltipText: getCssVar("--chart-tooltip-text"),
    }),
    [theme]
  );
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: ChartPoint;
}

function CustomDot({ cx, cy, payload }: CustomDotProps) {
  if (!payload?.isRelapse || cx === undefined || cy === undefined) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#ef4444"
      stroke={getCssVar("--c-bg")}
      strokeWidth={2}
    />
  );
}

function HeatmapCalendar({ history }: { history: HistoryEntry[] }) {
  const WEEKS = 26;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateMap = useMemo(() => {
    const map = new Map<string, "clean" | "relapse">();
    for (const entry of history) {
      const d = entry.timestamp.split("T")[0];
      if (!map.has(d) || entry.type === "relapse") map.set(d, entry.type);
    }
    return map;
  }, [history]);

  const weeks = useMemo(() => {
    const start = new Date(today);
    start.setDate(today.getDate() - (WEEKS * 7 - 1));
    const dayOfWeek = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dayOfWeek);

    const result: Array<Array<{ date: Date; type: string }>> = [];
    const cur = new Date(start);

    while (result.length < WEEKS + 1) {
      const week: Array<{ date: Date; type: string }> = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = cur.toISOString().split("T")[0];
        const isFuture = cur > today;
        const type = isFuture ? "future" : (dateMap.get(dateStr) ?? "empty");
        week.push({ date: new Date(cur), type });
        cur.setDate(cur.getDate() + 1);
      }
      result.push(week);
      if (cur > today) break;
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMap]);

  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {week.map((day, di) => (
            <div
              key={di}
              className="w-[9px] h-[9px] rounded-[2px] shrink-0"
              style={{
                background:
                  day.type === "clean"
                    ? "var(--c-accent)"
                    : day.type === "relapse"
                    ? "var(--c-relapse-text)"
                    : day.type === "future"
                    ? "transparent"
                    : "var(--c-border)",
                opacity: day.type === "future" ? 0 : day.type === "empty" ? 0.5 : 1,
              }}
              title={day.date.toLocaleDateString()}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function StatsView({ habit, onBack }: StatsViewProps) {
  const { t } = useLang();
  const data = useMemo(() => buildChartData(habit), [habit]);
  const colors = useChartColors();

  const relapseNotes = useMemo(
    () =>
      habit.history
        .filter((e) => e.type === "relapse" && e.note)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [habit.history]
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6 pb-24"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-muted hover:text-primary transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.back}
        </button>
        <h1 className="text-primary font-semibold text-lg">{habit.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="stone border border-border rounded-2xl p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {habit.currentStreak}
          </div>
          <div className="text-xs text-muted mt-1">{t.currentStreak}</div>
        </div>
        <div className="stone border border-border rounded-2xl p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {habit.bestStreak}
          </div>
          <div className="text-xs text-muted mt-1">{t.bestStreak}</div>
        </div>
        <div className="stone border border-border rounded-2xl p-4">
          <div className="text-2xl font-bold text-relapse-text tabular-nums">
            {habit.totalRelapses}
          </div>
          <div className="text-xs text-muted mt-1">{t.totalRelapses}</div>
        </div>
      </div>

      <div className="stone border border-border rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
          {t.activity}
        </h2>
        <HeatmapCalendar history={habit.history} />
      </div>

      <div className="stone border border-border rounded-2xl p-5">
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted text-sm">
            {t.noHistory}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="streakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grid}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: colors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: colors.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: colors.tooltipBg,
                  border: `1px solid ${colors.tooltipBorder}`,
                  borderRadius: "12px",
                  color: colors.tooltipText,
                  fontSize: 12,
                }}
                itemStyle={{ color: "#6366f1" }}
                cursor={{ stroke: colors.grid, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="streak"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#streakGradient)"
                dot={<CustomDot />}
                activeDot={{ r: 5, fill: "#6366f1", stroke: colors.tooltipBg, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {relapseNotes.length > 0 && (
        <div className="stone border border-border rounded-2xl p-5 flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
            {t.relapseNotes}
          </h2>
          <div className="flex flex-col gap-2">
            {relapseNotes.map((entry, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-sm text-primary">{entry.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
