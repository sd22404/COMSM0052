import Button from "@/app/components/button";
import Input from "@/app/components/input";
import { Eyebrow, SectionTitle } from "@/app/components/text";
import { midiToNote } from "@/audio/engine";
import { useState } from "react";

const CELLS_PER_ROW = 4;

export default function Memory({
	memory,
	onMemoryChange,
}: {
	memory: number[];
	onMemoryChange: (address: number, value: number) => void;
}) {
	const [stringView, setStringView] = useState(false);
	const [drafts, setDrafts] = useState<Record<number, string>>({});
	const rows = Math.ceil(memory.length / CELLS_PER_ROW);

	return (
		<div className="flex h-full w-full flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<SectionTitle>Shared Memory</SectionTitle>
				<Button size="sm" variant="primary" onClick={() => setStringView((value) => !value)}>
					{stringView ? "Show numbers" : "Show notes"}
				</Button>
			</div>
			<div className="grid gap-2 overflow-y-auto pr-1">
				{Array.from({ length: rows }, (_, rowIndex) => {
					const startAddress = rowIndex * CELLS_PER_ROW;

					return (
						<div key={rowIndex} className="grid grid-cols-4 gap-2">
							{Array.from({ length: CELLS_PER_ROW }, (_, colIndex) => {
								const address = startAddress + colIndex;
								if (address >= memory.length) return null;

								const rawValue = drafts[address] ?? memory[address].toString();
								const parsedValue = Number.parseInt(rawValue, 10);
								const displayValue = stringView && !Number.isNaN(parsedValue) ? midiToNote(parsedValue) : rawValue;

								return (
									<div key={address} className="flex flex-col items-center gap-1">
										<Eyebrow>Addr {address.toString().padStart(2, "0")}</Eyebrow>
										<Input
											className="w-full"
											type="text"
											value={displayValue}
											title={`Address ${address} (decimal)`}
											onChange={(event) => {
												const nextValue = event.target.value;
												const parsed = Number.parseInt(nextValue, 10);

												if (Number.isNaN(parsed)) {
													setDrafts((current) => ({ ...current, [address]: nextValue }));
													return;
												}

												onMemoryChange(address, parsed);
												setDrafts((current) => {
													const nextDrafts = { ...current };
													delete nextDrafts[address];
													return nextDrafts;
												});
											}}
										/>
									</div>
								);
							})}
						</div>
					);
				})}
			</div>
		</div>
	);
}
