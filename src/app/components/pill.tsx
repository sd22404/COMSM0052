import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

type PillVariant = "active" | "idle" | "warning";
type PillSize = "sm" | "md";

const VARIANT_CLASSES: Record<PillVariant, string> = {
	active: "bg-ctp-green/20 text-ctp-green border border-ctp-green/30",
	idle: "bg-ctp-surface0 text-ctp-subtext0 border border-ctp-surface1",
	warning: "bg-ctp-yellow/20 text-ctp-yellow border border-ctp-yellow/30",
};

const VARIANT_HOVER_CLASSES: Record<PillVariant, string> = {
	active: "hover:cursor-pointer hover:bg-ctp-green/30",
	idle: "hover:cursor-pointer hover:bg-ctp-surface1",
	warning: "hover:cursor-pointer hover:bg-ctp-yellow/30",
};

const SIZE_CLASSES: Record<PillSize, string> = {
	sm: "text-xs px-1 py-0.5",
	md: "text-sm px-2 py-1",
};

interface PillProps extends ComponentPropsWithoutRef<"span"> {
	variant?: PillVariant;
	size?: PillSize;
}

export function Pill({ className, variant = "idle", size = "md", ...props }: PillProps) {
	return (
		<span
			className={cn(
				"rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
				VARIANT_CLASSES[variant],
				SIZE_CLASSES[size],
				className
			)}
			{...props}
		/>
	);
}

export function PillButton({ className, variant = "idle", size = "md", ...props }: PillProps) {
	return (
		<button
			className={cn(
				"rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
				VARIANT_CLASSES[variant],
				VARIANT_HOVER_CLASSES[variant],
				SIZE_CLASSES[size],
				className
			)}
			{...props}
		/>
	);
}
