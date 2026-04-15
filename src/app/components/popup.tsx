import { ComponentPropsWithoutRef } from "react";
import Card from "./card";
import { cn } from "./cn";

export default function Popup({ className, ...props }: ComponentPropsWithoutRef<"div">) {
	return (
		<Card variant="surface" className={cn("z-10 fade-in backdrop-blur", className)} {...props} />
	);
}
