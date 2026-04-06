import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

type CardVariant = "base" | "panel" | "surface";

const VARIANT_CLASSES: Record<CardVariant, string> = {
	base: "border border-ctp-surface0 bg-ctp-crust",
	panel: "border border-ctp-surface0 bg-ctp-mantle",
	surface: "border border-ctp-surface0 bg-ctp-surface0/40",
};

interface CardProps extends ComponentPropsWithoutRef<"div"> {
	variant?: CardVariant;
}

export default function Card({ className, variant = "base", ...props }: CardProps) {
	return (
		<div
			className={cn("rounded text-ctp-text", VARIANT_CLASSES[variant], className)}
			{...props}
		/>
	);
}
