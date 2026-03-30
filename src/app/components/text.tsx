import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

export function SectionTitle({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
	return <h2 className={cn("text-lg font-semibold text-ctp-text", className)} {...props} />;
}

export function SectionDescription({ className, ...props }: ComponentPropsWithoutRef<"p">) {
	return <p className={cn("text-sm text-ctp-subtext0", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: ComponentPropsWithoutRef<"span">) {
	return <span className={cn("text-[10px] font-semibold uppercase tracking-[0.22em] text-ctp-overlay1", className)} {...props} />;
}
