import Button from "../components/button";
import Popup from "../components/popup";
import { Body, Heading } from "../components/text";
import { createPortal } from "react-dom";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import { Lesson } from "@/common/types";

interface TutorialProps {
	lesson: Lesson;
	next: () => void;
}

interface PortalProps extends ComponentPropsWithoutRef<"div"> {
	anchorID?: string;
	side?: Lesson["side"];
}

const POPUP_OFFSET = 16;

function Portal({ children, anchorID, side = "right", ...props }: PortalProps) {
	const hasDocument = typeof document !== "undefined";
	const anchor = hasDocument && anchorID ? document.getElementById(anchorID) : null;
	const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

	useEffect(() => {
		if (!anchor) {
			setAnchorRect(null);
			return;
		}

		const updateAnchorRect = () => setAnchorRect(anchor.getBoundingClientRect());
		updateAnchorRect();

		const resizeObserver =
			typeof ResizeObserver !== "undefined"
				? new ResizeObserver(updateAnchorRect)
				: null;
		resizeObserver?.observe(anchor);

		window.addEventListener("resize", updateAnchorRect);
		window.addEventListener("scroll", updateAnchorRect, true);

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener("resize", updateAnchorRect);
			window.removeEventListener("scroll", updateAnchorRect, true);
		};
	}, [anchor]);

	useEffect(() => {
		if (!anchor) return;
		anchor.classList.add("relative", "z-70");
		return () => anchor.classList.remove("relative", "z-70");
	}, [anchor]);

	if (!hasDocument) return null;

	const anchoredStyle =
		anchorRect && side === "left"
			? {
				top: anchorRect.top,
				left: anchorRect.left - POPUP_OFFSET,
				transform: "translateX(-100%)",
			}
			: anchorRect
				? {
					top: anchorRect.top,
					left: anchorRect.right + POPUP_OFFSET,
				}
				: undefined;

	return (
		<>
			{createPortal(
				<div className="fixed inset-0 z-60 bg-ctp-crust/90" {...props} />,
				document.body
			)}
			{anchor && anchorRect
				? createPortal(
					<div className="fixed z-80" style={anchoredStyle}>
						{children}
					</div>,
					document.body
				)
				: createPortal(
					<div className="fixed inset-0 z-80 flex items-center justify-center p-4">
						{children}
					</div>,
					document.body
				)}
		</>
	);
}

export default function Tutorial({ lesson, next }: TutorialProps) {
	return (
		<Portal anchorID={lesson.anchorID} side={lesson.side}>
			<Popup className="w-sm flex flex-col gap-4">
				<Heading tone="mauve">{lesson.title}</Heading>
				<Body className="whitespace-pre-line">{lesson.text}</Body>
				<Button variant="primary" onClick={() => next()}>
					{lesson.buttonText || "Next"}
				</Button>
			</Popup>
		</Portal>
	)
}
