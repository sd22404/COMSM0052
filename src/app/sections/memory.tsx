import Button from "@/app/components/button";
import Input from "@/app/components/input";
import { Eyebrow, Subheading } from "@/app/components/text";
import { midiToNote } from "@/audio/engine";
import { MemoryHighlight } from "@/common/types";
import { useEffect, useState } from "react";
import Card from "../components/card";
import { cn } from "../components/cn";

interface MemoryProps {
	memory: number[];
	highlights: MemoryHighlight[];
	setMemory: (addr: number, val: number) => void;
}

export default function Memory({ memory, highlights, setMemory }: MemoryProps) {
	const [noteView, setNoteView] = useState(false);
	const [drafts, setDrafts] = useState<(number | string)[]>(memory);
	const highlightModes = new Map<number, "read" | "write">();

	for (const highlight of highlights) {
		const current = highlightModes.get(highlight.addr);
		if (current === "write") continue; // ??
		highlightModes.set(highlight.addr, highlight.mode);
	}

	useEffect(() => {
		setDrafts(memory);
	}, [memory]);

	return (
		<Card variant="panel" className="flex-1 min-h-0 p-4">
			<div className="flex h-full w-full flex-col gap-3">
				<div className="flex items-center justify-between">
					<Subheading>Shared Memory</Subheading>
					<Button size="sm" variant="primary" onClick={() => setNoteView((value) => !value)}>
						{noteView ? "Show numbers" : "Show notes"}
					</Button>
				</div>
				<div className="grid gap-2 overflow-y-auto grid-cols-4">
					{drafts.map((draft, addr) => {
						const valInt = parseInt(draft as string);
						const valDisplay = (noteView && !isNaN(valInt)) ? midiToNote(valInt) : draft;

						const read = highlightModes.get(addr) === "read";
						const write = highlightModes.get(addr) === "write";

						return (
							<div
								key={addr}
								className={cn(
									"flex flex-col items-center gap-1 transition-colors",
									// read && "bg-ctp-blue/10",
									// write && "bg-ctp-peach/10",
								)}
							>
								<Eyebrow
									className={cn(
										"transition-colors",
										read && "text-ctp-blue",
										write && "text-ctp-peach",
									)}
								>
									Addr {addr.toString().padStart(2, "0")}
								</Eyebrow>
								<Input
									className={cn(
										"w-full transition-colors",
										read && "border-ctp-blue text-ctp-blue",
										write && "border-ctp-peach text-ctp-peach",
									)}
									type="text"
									value={valDisplay}
									title={`Address ${addr}`}
									onChange={(e) => {
										const valStr = e.target.value;
										const valInt = parseInt(valStr); // TODO: handle note input as well

										if (!isNaN(valInt)) setMemory(addr, valInt);
										setDrafts((drafts) => drafts.map((draft, i) => (i === addr ? valStr : draft)));
									}}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</Card>
	);
}
