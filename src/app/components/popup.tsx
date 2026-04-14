import { ComponentPropsWithoutRef } from "react";
import Card from "./card";
import { cn } from "./cn";

export default function Popup({ className, ...props }: ComponentPropsWithoutRef<"div">) {
	return (
		<Card className={cn("fixed z-10 fade-in", className)} {...props} />
	);
}
