import Button from "@/app/components/button";
import Input from "@/app/components/input";
import { Eyebrow, Subheading } from "@/app/components/text";
import { midiToNote } from "@/audio/engine";
import { useEffect, useState } from "react";
import Card from "../components/card";

interface MemoryProps {
	memory: number[];
	setMemory: (addr: number, val: number) => void;
}

export default function Memory({ memory, setMemory }: MemoryProps) {
	const [noteView, setNoteView] = useState(false);
	const [drafts, setDrafts] = useState<(number | string)[]>(memory);

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

						return (
							<div key={addr} className="flex flex-col items-center gap-1">
								<Eyebrow>Addr {addr.toString().padStart(2, "0")}</Eyebrow>
								<Input
									className="w-full"
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
