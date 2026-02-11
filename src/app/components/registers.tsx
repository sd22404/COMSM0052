import { Register } from "@/core/types";

interface RegisterProps {
	registers: Record<Register, number>;
	onRegisterChange?: (reg: Register, val: number) => void;
}

export default function Registers({ registers, onRegisterChange }: RegisterProps) {
	return (
		<div>
			{Object.entries(registers).map(([key, val]) => (
				<div key={key} className="flex items-center gap-2 font-mono text-xl">
					<span className="font-bold text-yellow-500">{key}:</span>
					<span>{val}</span>
				</div>
			))}
		</div>
	);
}
