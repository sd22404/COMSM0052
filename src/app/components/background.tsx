import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

export default function Background({ className, ...props }: ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className={cn(
				"min-h-screen bg-linear-to-b from-ctp-mantle via-ctp-crust to-ctp-crust font-mono text-ctp-text",
				className,
			)}
			{...props}
		/>
	);
}
