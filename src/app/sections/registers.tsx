import { Register } from "@/common/types";
import Input from "../components/input";
import { Eyebrow } from "../components/text";

interface RegisterProps {
	registers: number[];
	onRegisterChange?: (reg: Register, val: number) => void;
}

export default function Registers({ registers, onRegisterChange }: RegisterProps) {

	return (
		<div className="flex flex-col gap-1 h-full overflow-y-auto">
			{registers.map((val, i) => (
				<div key={i} className="flex items-center justify-between gap-3">
					<span className="font-semibold text-ctp-subtext-0">{Register[i]}</span>
					<Input
						className="w-18"
						type="number"
						value={val}
						onChange={(e) => onRegisterChange?.(i, parseInt(e.target.value))}
					/>
				</div>
			))}
		</div>
	);
}
