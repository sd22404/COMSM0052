
export default function Memory({
	memory,
	onMemoryChange,
}: {
	memory: number[];
	onMemoryChange: (address: number, value: number) => void;
}) {
	return (
		<div className="flex flex-wrap font-mono text-sm">
			{Array.from({ length: memory.length }, (_, i) => (
				<div key={i} className="flex flex-col items-center" title={"0x" + i.toString(16).padStart(4, "0").toUpperCase()}>
					<input
						type="text"
						value={memory[i].toString(10).padStart(2, "0")}
						onChange={(e) => {
							const value = parseInt(e.target.value, 10);
							if (!isNaN(value) && value >= 0 && value <= 255) {
								onMemoryChange(i, value);
							}
						}}
						className="w-8 h-8 text-center border border-neutral-700 bg-transparent focus:outline-none focus:border-blue-500"
					/>
				</div>
			))}
		</div>
	);
}
