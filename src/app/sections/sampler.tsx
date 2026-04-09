import Button from "../components/button";
import Card from "../components/card";
import { cn } from "../components/cn";
import { useState } from "react";
import { Body, Subheading } from "../components/text";

interface SampleSelectorProps {
	samples: Map<number, string>;
	setSample: (note: number, sample: string) => void;
}

export default function SampleSelector({ samples, setSample }: SampleSelectorProps) {
	const [open, setOpen] = useState(false);

	return (
		<Card title="Sampler" variant="panel" className="w-full min-h-0">
			<div className="flex items-center justify-between">
				<Subheading>Sample Selector</Subheading>
				<Button variant="secondary" onClick={() => setOpen((value) => !value)} className="h-1h w-1h">
					{"<"}
				</Button>
			</div>

			<Card
				className={cn(
					"grid transition-[grid-template-rows,opacity,margin-top] duration-200 ease-out",
					open ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
				)}
			>
				<div className="overflow-hidden p-4">
					{Array.from(samples.entries()).map(([note, sample]) => (
						<Body key={note}>
							{note}: {sample.split("/").pop()}
						</Body>
					))}
				</div>
			</Card>
		</Card>
	);
}
