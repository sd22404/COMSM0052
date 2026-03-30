import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	primary: "bg-ctp-blue text-ctp-base hover:bg-ctp-blue/70",
	secondary: "bg-ctp-surface0 text-ctp-text hover:bg-ctp-surface1",
	danger: "bg-ctp-red text-ctp-base hover:bg-ctp-red/70",
	ghost: "bg-transparent text-ctp-subtext0 hover:bg-ctp-surface0 hover:text-ctp-text",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
	sm: "px-3 py-2 text-xs font-semibold",
	md: "px-4 py-2.5 text-sm font-semibold",
};

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

export default function Button({
	className,
	variant = "secondary",
	size = "md",
	type = "button",
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={cn(
				"rounded transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
				VARIANT_CLASSES[variant],
				SIZE_CLASSES[size],
				className,
			)}
			{...props}
		/>
	);
}
