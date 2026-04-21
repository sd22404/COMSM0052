import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

export default function Select({ className, ...props }: ComponentPropsWithoutRef<"select">) {
	return (
		<select
			className={cn(
				"h-8 rounded border border-ctp-surface1 bg-ctp-mantle px-2 text-sm text-ctp-text outline-none transition-colors",
				"focus:ring-ctp-blue focus:ring-inset focus:ring-1",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
