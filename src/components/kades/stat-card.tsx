"use client";

interface StatCardProps {
  title: string;
  value: string;
  valueUnit?: string;
  progressPercent: number;
  progressColor: string;
  valueColor: string;
  sublabel: string;
  sublabelColor?: string;
  sublabelRight: string;
}

export function StatCard({
  title,
  value,
  valueUnit,
  progressPercent,
  progressColor,
  valueColor,
  sublabel,
  sublabelColor,
  sublabelRight,
}: StatCardProps) {
  return (
    <div className="glass-panel p-5">
      <h4 className="text-[13px] font-bold uppercase text-[var(--color-muted)] tracking-wide mb-1">
        {title}
      </h4>
      <div className="flex items-baseline gap-1.5 mb-3">
        <span
          className="text-[22px] font-extrabold"
          style={{ color: valueColor }}
        >
          {value}
        </span>
        {valueUnit && (
          <span className="text-[12px] text-[var(--color-muted)] font-medium">
            {valueUnit}
          </span>
        )}
      </div>
      <div
        className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5"
        role="progressbar"
        aria-valuenow={isNaN(progressPercent) ? 0 : progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${isNaN(progressPercent) ? 0 : progressPercent}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>
      <div className="flex justify-between text-[11px]">
        <span
          className="font-semibold"
          style={{ color: sublabelColor ?? valueColor }}
        >
          {sublabel}
        </span>
        <span className="text-[var(--color-muted)]">{sublabelRight}</span>
      </div>
    </div>
  );
}
