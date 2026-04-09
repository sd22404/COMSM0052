import { Register, RegisterHighlight } from "@/common/types";
import { cn } from "../components/cn";
import Input from "../components/input";
import { Body, Eyebrow } from "../components/text";
import { useEffect, useState } from "react";

interface RegisterProps {
	registers: number[];
	highlights: RegisterHighlight[];
	setRegister: (reg: Register, val: number) => void;
}

export default function Registers({ registers, highlights, setRegister }: RegisterProps) {
	const [drafts, setDrafts] = useState<(number | string)[]>(registers);
	const highlightModes = new Map<Register, "read" | "write">();

	for (const highlight of highlights) {
		const current = highlightModes.get(highlight.reg);
		if (current === "write") continue; // ??
		highlightModes.set(highlight.reg, highlight.mode);
	}

	useEffect(() => {
		setDrafts(registers);
	}, [registers]);

	return (
		<div className="flex flex-col gap-2">
			<Eyebrow className="text-md">REGISTERS</Eyebrow>
			<div className="flex flex-col gap-1 h-full overflow-y-auto overflow-x-hidden">
				{drafts.map((draft, i) => {
					const reg = i as Register;
					const read = highlightModes.get(reg) === "read";
					const write = highlightModes.get(reg) === "write";

					return (
					<div
						key={i}
						className={cn(
							"flex items-center justify-between gap-3 transition-colors",
							// read && "bg-ctp-blue/10",
							// write && "bg-ctp-peach/10",
						)}
					>
						<Body
							className={cn(
								"font-semibold text-ctp-subtext0 transition-colors",
								read && "text-ctp-blue",
								write && "text-ctp-peach",
							)}
						>
							{Register[i]}
						</Body>
						<Input
							className={cn(
								"w-18 transition-colors",
								read && "border-ctp-blue text-ctp-blue",
								write && "border-ctp-peach text-ctp-peach",
							)}
							type="number"
							value={draft}
							onChange={(e) => {
								const valStr = e.target.value;
								const valInt = parseInt(valStr);

								if (!isNaN(valInt)) setRegister(reg, valInt);
								setDrafts((drafts) => drafts.map((draft, j) => (j === i ? valStr : draft)));
							}}
						/>
					</div>
					);
				})}
			</div>
		</div>
	);
}
