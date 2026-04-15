"use client";

import { TourStep } from "@/common/types";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../components/button";
import Popup from "../components/popup";
import { Body, Eyebrow, Heading } from "../components/text";

interface TutorialSpotlightProps {
	step: TourStep;
	stepIndex: number;
	stepCount: number;
	onNext: () => void;
}

interface PortalProps extends ComponentPropsWithoutRef<"div"> {
	anchorID?: string;
	side?: TourStep["side"];
}

const POPUP_OFFSET = 16;

function Portal({ children, anchorID, side = "right", ...props }: PortalProps) {
	const hasDocument = typeof document !== "undefined";
	const anchor = hasDocument && anchorID ? document.getElementById(anchorID) : null;
	const [layoutVersion, setLayoutVersion] = useState(0);
	void layoutVersion;

	useEffect(() => {
		if (!anchor) return;

		const refresh = () => setLayoutVersion((current) => current + 1);
		const resizeObserver =
			typeof ResizeObserver !== "undefined"
				? new ResizeObserver(refresh)
				: null;

		resizeObserver?.observe(anchor);
		window.addEventListener("resize", refresh);
		window.addEventListener("scroll", refresh, true);

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener("resize", refresh);
			window.removeEventListener("scroll", refresh, true);
		};
	}, [anchor]);

	useEffect(() => {
		if (!anchor) return;
		anchor.classList.add("relative", "z-70");
		return () => anchor.classList.remove("relative", "z-70");
	}, [anchor]);

	if (!hasDocument) return null;

	const anchorRect = anchor?.getBoundingClientRect() ?? null;
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
				document.body,
			)}
			{anchor && anchorRect
				? createPortal(
					<div className="fixed z-80" style={anchoredStyle}>
						{children}
					</div>,
					document.body,
				)
				: createPortal(
					<div className="fixed inset-0 z-80 flex items-center justify-center p-4">
						{children}
					</div>,
					document.body,
				)}
		</>
	);
}

export default function TutorialSpotlight({
	step,
	stepIndex,
	stepCount,
	onNext,
}: TutorialSpotlightProps) {
	return (
		<Portal anchorID={step.anchorID} side={step.side}>
			<Popup className="flex w-[22rem] flex-col gap-4">
				<Eyebrow tone="mauve">
					Tour step {stepIndex + 1} of {stepCount}
				</Eyebrow>
				<Heading tone="mauve">{step.title}</Heading>
				<Body className="whitespace-pre-line">{step.text}</Body>
				<Button variant="primary" onClick={onNext}>
					{step.buttonText || "Next"}
				</Button>
			</Popup>
		</Portal>
	);
}
