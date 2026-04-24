"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface TutorialSpotlightProps {
	anchorIDs: string[];
}

const HIGHLIGHT_CLASSES = [
	"relative",
	"z-70",
];

export default function TutorialSpotlight({ anchorIDs }: TutorialSpotlightProps) {
	const hasDocument = typeof document !== "undefined";
	const anchorKey = anchorIDs.join(":");

	useEffect(() => {
		if (!hasDocument || anchorIDs.length === 0) return;

		const anchors = anchorIDs
			.map((anchorID) => document.getElementById(anchorID))
			.filter((anchor): anchor is HTMLElement => anchor !== null);

		for (const anchor of anchors)
			anchor.classList.add(...HIGHLIGHT_CLASSES);

		return () => {
			for (const anchor of anchors)
				anchor.classList.remove(...HIGHLIGHT_CLASSES);
		};
	}, [anchorIDs, anchorKey, hasDocument]);

	if (!hasDocument || anchorIDs.length === 0) return null;

	return createPortal(
		<div className="pointer-events-none fixed inset-0 z-60 bg-ctp-crust/88" />,
		document.body,
	);
}
