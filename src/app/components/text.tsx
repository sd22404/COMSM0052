import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

export function Heading({ className, ...props }: ComponentPropsWithoutRef<"h1">) {
	return <h1 className={cn("text-2xl font-bold text-ctp-text", className)} {...props} />;
}

export function Subheading({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
	return <h2 className={cn("text-xl font-semibold text-ctp-text", className)} {...props} />;
}

export function Subsubheading({ className, ...props }: ComponentPropsWithoutRef<"h3">) {
	return <h3 className={cn("text-lg font-medium text-ctp-text", className)} {...props} />;
}

export function Body({ className, ...props }: ComponentPropsWithoutRef<"p">) {
	return <p className={cn("text-base text-ctp-text", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: ComponentPropsWithoutRef<"span">) {
	return <span className={cn("text-xs font-semibold uppercase tracking-[0.1em] text-ctp-overlay1", className)} {...props} />;
}
