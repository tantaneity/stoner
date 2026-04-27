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
import type { Habit, ChartPoint } from "../types";
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

export default function StatsView({ habit, onBack }: StatsViewProps) {
  const { t } = useLang();
  const data = useMemo(() => buildChartData(habit), [habit]);
  const colors = useChartColors();

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
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {habit.currentStreak}
          </div>
          <div className="text-xs text-muted mt-1">{t.currentStreak}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {habit.bestStreak}
          </div>
          <div className="text-xs text-muted mt-1">{t.bestStreak}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <div className="text-2xl font-bold text-relapse-text tabular-nums">
            {habit.totalRelapses}
          </div>
          <div className="text-xs text-muted mt-1">{t.totalRelapses}</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5">
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
    </motion.div>
  );
}
