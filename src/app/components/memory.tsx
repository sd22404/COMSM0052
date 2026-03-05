export default function Memory({
	memory,
	onMemoryChange,
}: {
	memory: (number | string)[];
	onMemoryChange: (address: number, value: number | string) => void;
}) {
	const rows = Math.ceil(memory.length / 8);
	
	return (
		<div className="font-mono overflow-scroll">
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
										value={memory[i]}
										onChange={(e) => {
											onMemoryChange(i, e.target.value);
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
