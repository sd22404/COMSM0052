import { useState, useEffect } from "react";
import { Register } from "@/core/types";

interface RegisterProps {
	registers: Record<Register, number>;
	onRegisterChange?: (reg: Register, val: number) => void;
}

function RegisterInput({ regKey, val, onChange }: { regKey: Register; val: number; onChange?: (reg: Register, val: number) => void }) {
	const [raw, setRaw] = useState(val.toString());

	useEffect(() => { setRaw(val.toString()); }, [val]);

	return (
		<div className="flex items-center gap-4">
			<span className="font-bold text-yellow-500">{regKey}</span>
			<input type="text"
				value={raw}
				onChange={(e) => {
					setRaw(e.target.value);
					const intVal = parseInt(e.target.value, 10);
					if (!isNaN(intVal)) onChange?.(regKey, intVal);
				}}
				className="w-16 h-12 text-center border border-neutral-700 bg-transparent focus:outline-none focus:border-blue-500"
			/>
		</div>
	);
}

export default function Registers({ registers, onRegisterChange }: RegisterProps) {
	return (
		<div className="flex gap-6 font-mono">
			{Object.entries(registers).map(([key, val]) => (
				<RegisterInput key={key} regKey={key as Register} val={val} onChange={onRegisterChange} />
			))}
		</div>
	);
}
