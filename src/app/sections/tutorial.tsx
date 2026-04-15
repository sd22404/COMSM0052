import Button from "../components/button";
import Popup from "../components/popup";
import { Body, Heading } from "../components/text";
import { createPortal } from "react-dom";
import { ComponentPropsWithoutRef, useEffect } from "react";
import { Lesson } from "@/common/types";

interface TutorialProps {
	lesson: Lesson;
	next: () => void;
}

interface PortalProps extends ComponentPropsWithoutRef<"div"> {
	anchorID?: string;
}

function Portal({ children, anchorID, ...props }: PortalProps) {
	const hasDocument = typeof document !== "undefined";
	const anchor = hasDocument && anchorID ? document.getElementById(anchorID) : null;

	useEffect(() => {
		if (!anchor) return;
		anchor.classList.add("relative", "z-70");
		return () => anchor.classList.remove("relative", "z-70");
	}, [anchor]);

	if (!hasDocument) return null;

	return (
		<>
			{createPortal(
				<div className="fixed inset-0 z-60 bg-ctp-crust/90" {...props} />,
				document.body
			)}
			{anchor
				? createPortal(
					<div className="absolute left-full z-80 top-0 ml-4">
						{children}
					</div>,
					anchor
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
		<Portal anchorID={lesson.anchorID}>
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
