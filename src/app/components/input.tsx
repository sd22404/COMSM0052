import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

export default function Input({ className, ...props }: ComponentPropsWithoutRef<"input">) {
	return (
		<input
			className={cn(
				"h-8 rounded-md border border-ctp-surface1 bg-ctp-mantle px-2 text-sm text-ctp-text outline-none transition-colors placeholder:text-ctp-overlay0 focus:border-ctp-blue",
				className,
			)}
			{...props}
		/>
	);
}
