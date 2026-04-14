import { Register, RegisterAccess } from "@/common/types";
import { cn } from "../components/cn";
import Input from "../components/input";
import { Eyebrow } from "../components/text";
import { useEffect, useState } from "react";
import Card from "../components/card";

interface RegisterProps {
	registers: number[];
	highlights: RegisterAccess[];
	onRegisterChange: (reg: Register, val: number) => void;
}

export default function Registers({ registers, highlights, onRegisterChange }: RegisterProps) {
	const [drafts, setDrafts] = useState<(number | string)[]>(registers);
	const highlightModes = new Map<Register, "read" | "write">();

	for (const highlight of highlights) {
		const current = highlightModes.get(highlight.reg);
		if (current === "write") continue;
		highlightModes.set(highlight.reg, highlight.mode);
	}

	useEffect(() => {
		setDrafts(registers);
	}, [registers]);

	return (
		<Card className="p-0 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
			{drafts.map((draft, i) => {
				const reg = i as Register;
				const read = highlightModes.get(reg) === "read";
				const write = highlightModes.get(reg) === "write";

				return (
				<div
					key={i}
					className={cn(
						"shrink-0 rounded px-2 flex items-center justify-between overflow-hidden transition-colors",
						"focus-within:ring-1 focus-within:ring-inset focus-within:ring-ctp-blue",
						read && "ring-1 ring-inset ring-ctp-blue/50 text-ctp-blue bg-ctp-blue/10",
						write && "ring-1 ring-inset ring-ctp-peach/50 text-ctp-peach bg-ctp-peach/10",
					)}
				>
					<Eyebrow
						className={cn(
							"text-sm",
							read && "text-ctp-blue",
							write && "text-ctp-peach",
						)}
					>
						{Register[i]}
					</Eyebrow>
					<Input
						className={cn(
							"w-14 border-0 bg-transparent text-right text-sm font-semibold",
							"focus:border-transparent focus:ring-0",
							read && "text-ctp-blue",
							write && "text-ctp-peach",
						)}
						type="text"
						value={draft}
						onChange={(e) => {
							const valStr = e.target.value;
							const valInt = parseInt(valStr);

							if (!isNaN(valInt)) onRegisterChange(reg, valInt);
							setDrafts((drafts) => drafts.map((draft, j) => (j === i ? valStr : draft)));
						}}
					/>
				</div>
				);
			})}
		</Card>
	);
}
