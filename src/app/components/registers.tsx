import { Register } from "@/core/types";

interface RegisterProps {
	registers: Record<Register, number>;
	onRegisterChange?: (reg: Register, val: number) => void;
}

export default function Registers({ registers, onRegisterChange }: RegisterProps) {
	return (
		<div className="flex gap-6 font-mono">
			{Object.entries(registers).map(([key, val]) => (
				<div key={key} className="flex items-center gap-4">
					<span className="font-bold text-yellow-500">{key}</span>
					<input type="text"
						value={val.toString(10).padStart(2, "0")}
						onChange={(e) => {
							const value = parseInt(e.target.value, 10);
							if (!isNaN(value) && value >= 0 && value <= 255 && onRegisterChange) {
								onRegisterChange(key as Register, value);
							}
						}}
						className="w-16 h-12 text-center border border-neutral-700 bg-transparent focus:outline-none focus:border-blue-500"
					/>
				</div>
			))}
		</div>
	);
}
