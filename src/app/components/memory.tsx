import { midiToNote } from "@/audio/engine";
import { useState } from "react";

export default function Memory({
	memory,
	onMemoryChange,
}: {
	memory: number[];
	onMemoryChange: (address: number, value: number) => void;
}) {
	
	const [stringView, setStringView] = useState<boolean>(false);
	const [locals, setLocals] = useState<string[]>(memory.map(val => val.toString()));
	const rows = Math.ceil(memory.length / 8);
	
	return (
		<div className="font-mono overflow-scroll flex flex-col gap-2 items-end">
			<button className="bg-blue-500 hover:bg-blue-600 text-sm p-2 rounded" onClick={() => setStringView(v => !v)}>
				Toggle Note View
			</button>
			{Array.from({ length: rows }, (_, rowIndex) => {
				const startAddress = rowIndex * 8;
				return (
					<div key={rowIndex} className="flex items-center gap-2 mb-1">
						<div className="text-neutral-500 w-32">
							{"0x" + startAddress.toString(16).padStart(4, "0").toUpperCase()}
						</div>
						<div className="flex">
							{Array.from({ length: 8 }, (_, colIndex) => {
								const i = startAddress + colIndex;
								if (i >= memory.length) return null;
								return (
									<input
										key={i}
										type="text"
										value={
											(stringView && !isNaN(parseInt(locals[i])))
												? midiToNote(parseInt(locals[i]))
												: locals[i]
										}
										onChange={(e) => {
											const newVal = e.target.value;
											const updated = [...locals];
											updated[i] = newVal;
											setLocals(updated);

											const asInt = parseInt(newVal);
											if (isNaN(asInt)) return;
											onMemoryChange(i, asInt);
										}}
										className="w-16 h-12 text-center border border-neutral-700 bg-transparent focus:outline-none focus:border-blue-500"
										title={"0x" + i.toString(16).padStart(4, "0").toUpperCase()}
									/>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
