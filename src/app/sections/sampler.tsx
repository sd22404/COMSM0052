import Button from "../components/button";
import Card from "../components/card";
import { cn } from "../components/cn";
import { useState } from "react";
import { Body, Subheading } from "../components/text";

interface SampleSelectorProps {
	samples: Map<number, string>;
	onSampleChange: (note: number, sample: string) => void;
}

export default function SampleSelector({ samples, onSampleChange }: SampleSelectorProps) {
	const [open, setOpen] = useState(true);
	void onSampleChange;

	return (
		<Card id="samples" title="Sampler" variant="panel" className="w-full min-h-0">
			<div className="flex items-center justify-between">
				<Subheading tone="peach">Drum Note Map</Subheading>
				<Button
					variant="secondary"
					tone="peach"
					onClick={() => setOpen((value) => !value)}
					className="h-1h w-1h"
				>
					{open ? "Hide" : "Show"}
				</Button>
			</div>

			<Card
				className={cn(
					"p-0 grid transition-[grid-template-rows,opacity,margin-top] duration-200 ease-out",
					open ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
				)}
			>
				<div className="overflow-hidden p-4">
					{Array.from(samples.entries()).map(([note, sample]) => (
						<Body key={note} tone="subtle" className="flex items-center justify-between gap-4">
							<span className="font-semibold text-ctp-peach">{note}</span>
							<span className="truncate text-right">{
								note == 60 ? "Kick" : note == 61 ? "Snare" : note == 62 ? "Hi-Hat" : sample.toString().split("/").pop()
							}</span>
							{/* <span className="truncate text-right">{sample.toString().split("/").pop()}</span> */}
						</Body>
					))}
				</div>
			</Card>
		</Card>
	);
}
