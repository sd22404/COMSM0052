import { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

type TextTone = "default" | "subtle" | "blue" | "mauve" | "peach" | "green";

const TONE_CLASSES: Record<TextTone, string> = {
	default: "text-ctp-text",
	subtle: "text-ctp-subtext0",
	blue: "text-ctp-blue",
	mauve: "text-ctp-mauve",
	peach: "text-ctp-peach",
	green: "text-ctp-green",
};

interface HeadingProps extends ComponentPropsWithoutRef<"h1"> {
	tone?: TextTone;
}

interface SubheadingProps extends ComponentPropsWithoutRef<"h2"> {
	tone?: TextTone;
}

interface SubsubheadingProps extends ComponentPropsWithoutRef<"h3"> {
	tone?: TextTone;
}

interface BodyProps extends ComponentPropsWithoutRef<"p"> {
	tone?: TextTone;
}

interface EyebrowProps extends ComponentPropsWithoutRef<"span"> {
	tone?: TextTone;
}

export function Heading({ className, tone = "default", ...props }: HeadingProps) {
	return <h1 className={cn("text-2xl font-bold", TONE_CLASSES[tone], className)} {...props} />;
}

export function Subheading({ className, tone = "default", ...props }: SubheadingProps) {
	return <h2 className={cn("text-xl font-semibold", TONE_CLASSES[tone], className)} {...props} />;
}

export function Subsubheading({ className, tone = "default", ...props }: SubsubheadingProps) {
	return <h3 className={cn("text-lg font-medium", TONE_CLASSES[tone], className)} {...props} />;
}

export function Body({ className, tone = "default", ...props }: BodyProps) {
	return <p className={cn("text-base", TONE_CLASSES[tone], className)} {...props} />;
}

export function Eyebrow({ className, tone = "subtle", ...props }: EyebrowProps) {
	return <span className={cn("text-xs font-semibold uppercase tracking-widest", TONE_CLASSES[tone], className)} {...props} />;
}
