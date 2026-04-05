import { Register } from "@/common/types";
import Input from "../components/input";
import { Body, Eyebrow } from "../components/text";
import { useState } from "react";

interface RegisterProps {
	registers: number[];
	onRegisterChange: (reg: Register, val: number) => void;
}

export default function Registers({ registers, onRegisterChange }: RegisterProps) {
	const [drafts, setDrafts] = useState<(number | string)[]>(registers);

	return (
		<div className="flex flex-col gap-2">
			<Eyebrow className="text-md">REGISTERS</Eyebrow>
			<div className="flex flex-col gap-1 h-full overflow-y-auto">
				{drafts.map((draft, i) => (
					<div key={i} className="flex items-center justify-between gap-3">
						<Body className="font-semibold text-ctp-subtext0">
							{Register[i]}
						</Body>
						<Input
							className="w-18"
							type="number"
							value={draft}
							onChange={(e) => {
								const valStr = e.target.value;
								const valInt = parseInt(valStr);

								if (!isNaN(valInt)) onRegisterChange(i, valInt);
								setDrafts((drafts) => drafts.map((draft, j) => (j === i ? valStr : draft)));
							}}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
