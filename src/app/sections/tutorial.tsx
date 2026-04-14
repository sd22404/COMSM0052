import Button from "../components/button";
import Popup from "../components/popup";
import { Body, Subsubheading } from "../components/text";
import { createPortal } from "react-dom";
import { ComponentPropsWithoutRef, useEffect, useState } from "react";

interface TutorialProps {
	title: string;
	text: string;
	anchorID: string;
	next: () => void;
}

interface PortalProps extends ComponentPropsWithoutRef<"div"> {
	anchorID: string;
}

function Portal({ children, anchorID, ...props }: PortalProps) {
	const [container, setContainer] = useState<Element | null>(null);

	useEffect(() => {
		setContainer(document.getElementById(anchorID) || document.body);
	}, [anchorID]);

	if (!container) return null;
	return (
		<div className="fixed inset-0 z-5 flex items-center justify-center bg-ctp-crust/80" {...props}>
		{createPortal(
			children,
			container
		)}
		</div>
	);
}

export default function Tutorial({ title, text, anchorID, next }: TutorialProps) {
	return (
		<Portal anchorID={anchorID}>
			<Popup className="w-md flex flex-col gap-4">
				<Subsubheading>{title}</Subsubheading>
				<Body>{text}</Body>
				<Button variant="secondary" onClick={() => next()} className="">
					Next
				</Button>
			</Popup>
		</Portal>
	)
}
