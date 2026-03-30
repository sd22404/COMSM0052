import { ReactNode } from "react";
import { cn } from "./cn";

type StatusTone = "active" | "idle";

const TONE_CLASSES: Record<StatusTone, string> = {
	active: "bg-ctp-green/20 text-ctp-green border border-ctp-green/30",
	idle: "bg-ctp-surface0 text-ctp-subtext0 border border-ctp-surface1",
};

interface StatusPillProps {
	children: ReactNode;
	className?: string;
	tone?: StatusTone;
}

export default function StatusPill({ children, className, tone = "idle" }: StatusPillProps) {
	return (
		<span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]", TONE_CLASSES[tone], className)}>
			{children}
		</span>
	);
}
