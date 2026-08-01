import type { LucideIcon } from "lucide-react";

export function IconChip({
  icon: Icon,
  size = 44,
}: {
  icon: LucideIcon;
  size?: number;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-brand-primary-soft border border-border-default shrink-0"
      style={{ width: size, height: size }}
    >
      <Icon className="text-brand-primary" size={size * 0.45} strokeWidth={1.75} />
    </div>
  );
}
