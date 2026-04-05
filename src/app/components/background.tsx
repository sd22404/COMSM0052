import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

export default function Background({ className, ...props }: ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className={cn("min-h-screen bg-ctp-base font-mono text-ctp-text", className)}
			{...props}
		/>
	);
}
