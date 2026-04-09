import Button from "@/app/components/button";
import Input from "@/app/components/input";
import { Eyebrow, Subheading } from "@/app/components/text";
import { midiToNote, noteToMidi } from "@/audio/engine";
import { MemoryAccess } from "@/common/types";
import { useEffect, useMemo, useState } from "react";
import Card from "../components/card";
import { cn } from "../components/cn";

const STEPS_PER_ROW = 8;

function parseMemory(input: string): number | undefined {
	const value = input.trim();
	if (!value) return undefined;

	if (/^-?\d+$/.test(value))
		return parseInt(value);

	return noteToMidi(value);
}

interface MemoryProps {
	memory: number[];
	highlights: MemoryAccess[];
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

	const rowStarts = useMemo(
		() => Array.from({ length: Math.ceil(drafts.length / STEPS_PER_ROW) }, (_, row) => row * STEPS_PER_ROW),
		[drafts.length],
	);

	return (
		<Card variant="panel" className="flex-1 min-h-0">
			<div className="flex h-full w-full flex-col gap-3">
				<div className="flex items-center justify-between">
					<Subheading>Memory</Subheading>
					<Button size="sm" variant="primary" onClick={() => setNoteView((value) => !value)}>
						{noteView ? "Show numbers" : "Show notes"}
					</Button>
				</div>
				<div className="flex min-h-0 flex-col gap-1 overflow-y-auto overflow-x-hidden">
					{rowStarts.map((startAddr) => (
						<Card key={startAddr}>
							<div className="grid grid-cols-8">
								{drafts.slice(startAddr, startAddr + STEPS_PER_ROW).map((draft, offset) => {
									const addr = startAddr + offset;
									const draftText = draft.toString();
									const parsed = parseMemory(draftText);
									const valDisplay = noteView && parsed !== undefined ? midiToNote(parsed) : draftText;

									const read = highlightModes.get(addr) === "read";
									const write = highlightModes.get(addr) === "write";
									const invalid = draftText.trim().length > 0 && parsed === undefined;
									const state = write ? "write" : invalid ? "invalid" : read ? "read" : "base";

									return (
										<div
											key={addr}
											className={cn(
												"py-2 flex flex-col items-center justify-between overflow-hidden rounded transition-colors",
												"focus-within:ring-1 focus-within:ring-inset focus-within:ring-ctp-blue",
												state === "base" && "bg-ctp-crust",
												state === "read" && "bg-ctp-blue/10 ring-1 ring-inset ring-ctp-blue/50",
												state === "write" && "bg-ctp-peach/10 ring-1 ring-inset ring-ctp-peach/50",
												state === "invalid" && "bg-ctp-red/10 ring-1 ring-inset ring-ctp-red/50",
											)}
										>
											<Eyebrow
												className={cn(
													"text-center",
													state === "read" && "text-ctp-blue",
													state === "write" && "text-ctp-peach",
													state === "invalid" && "text-ctp-red",
												)}
											>
												{addr.toString().padStart(2, "0")}
											</Eyebrow>
											<Input
												className={cn(
													"w-full border-0 bg-transparent text-center text-sm font-semibold",
													"focus:border-transparent focus:ring-0",
													state === "read" && "text-ctp-blue",
													state === "write" && "text-ctp-peach",
													state === "invalid" && "text-ctp-red",
												)}
												type="text"
												value={valDisplay}
												title={`Address ${addr}`}
												onChange={(e) => {
													const nextText = e.target.value;
													const nextValue = parseMemory(nextText);

													if (nextValue !== undefined) setMemory(addr, nextValue);
													setDrafts((drafts) => drafts.map((draft, i) => (i === addr ? nextText : draft)));
												}}
											/>
										</div>
									);
								})}
							</div>
						</Card>
					))}
				</div>
			</div>
		</Card>
	);
}
