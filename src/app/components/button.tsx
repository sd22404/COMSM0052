import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonTone = "blue" | "mauve" | "peach" | "green" | "subtle" | "default";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	primary: "text-ctp-base bg-ctp-blue hover:bg-ctp-sky",
	secondary: "bg-ctp-surface0 hover:bg-ctp-surface1",
	danger: "text-ctp-base bg-ctp-red hover:bg-ctp-maroon",
	ghost: "text-ctp-subtext0 bg-transparent hover:text-ctp-text hover:bg-ctp-surface0",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
	sm: "px-3 py-2 text-xs font-semibold",
	md: "px-4 py-2.5 text-sm font-semibold",
	lg: "px-5 py-3 text-base font-semibold",
};

const TONE_CLASSES: Record<ButtonTone, string> = {
	blue: "text-ctp-blue",
	mauve: "text-ctp-mauve",
	peach: "text-ctp-peach",
	green: "text-ctp-green",
	subtle: "text-ctp-subtext0",
	default: "text-ctp-text",
};

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	tone?: ButtonTone;
}

export default function Button({
	className,
	variant = "secondary",
	size = "md",
	tone = "default",
	type = "button",
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={cn(
				"rounded transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
				TONE_CLASSES[tone],
				SIZE_CLASSES[size],
				VARIANT_CLASSES[variant],
				className,
			)}
			{...props}
		/>
	);
}
