import { ComponentPropsWithoutRef } from "react";
import Popup from "./popup";
import { cn } from "./cn";

type TooltipSide = "top" | "bottom";
type TooltipAlign = "start" | "centre" | "end";

const SIDE_CLASSES: Record<TooltipSide, string> = {
	top: "bottom-full mb-2 translate-y-1",
	bottom: "top-full mt-2 -translate-y-1",
};

const ALIGN_CLASSES: Record<TooltipAlign, string> = {
	start: "left-0",
	centre: "left-1/2 -translate-x-1/2",
	end: "right-0",
};

interface TooltipProps extends ComponentPropsWithoutRef<"div"> {
	text: string;
	contentClassName?: string;
	side?: TooltipSide;
	align?: TooltipAlign;
}

export default function Tooltip({
	children,
	className,
	text,
	contentClassName,
	side = "bottom",
	align = "centre",
	...props
}: TooltipProps) {
	return (
		<div className={cn("group/tooltip relative inline-flex", className)} {...props}>
			{children}
			<Popup
				className={cn(
					"pointer-events-none absolute z-20 w-max max-w-72 px-2 py-1.5 text-xs text-ctp-subtext0 opacity-0 shadow-lg transition duration-150",
					SIDE_CLASSES[side],
					ALIGN_CLASSES[align],
					"group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100",
					"group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:opacity-100",
					contentClassName,
				)}
			>
				{text}
			</Popup>
		</div>
	);
}
