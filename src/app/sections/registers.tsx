import { Register, RegisterAccess } from "@/common/types";
import { cn } from "../components/cn";
import Input from "../components/input";
import { Eyebrow } from "../components/text";
import { useState } from "react";
import Card from "../components/card";

interface RegisterProps {
	id?: string;
	registers: number[];
	highlights: RegisterAccess[];
	onRegisterChange: (reg: Register, val: number) => void;
}

export default function Registers({ id, registers, highlights, onRegisterChange }: RegisterProps) {
	const [drafts, setDrafts] = useState<Record<number, string>>({});
	const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
	const highlightModes = new Map<Register, "read" | "write">();

	for (const highlight of highlights) {
		const current = highlightModes.get(highlight.reg);
		if (current === "write") continue;
		highlightModes.set(highlight.reg, highlight.mode);
	}

	return (
		<Card id={id} className="p-0 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
			{registers.map((value, i) => {
				const reg = i as Register;
				const draft = focusedIndex === i ? drafts[i] ?? value.toString() : value;
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
						onFocus={() => {
							setFocusedIndex(i);
							setDrafts((drafts) => ({ ...drafts, [i]: draft.toString() }));
						}}
						onBlur={() => {
							const valInt = parseInt(draft.toString(), 10);
							setFocusedIndex(null);
							if (isNaN(valInt)) {
								setDrafts((drafts) => {
									const next = { ...drafts };
									delete next[i];
									return next;
								});
								return;
							}

							onRegisterChange(reg, valInt);
							setDrafts((drafts) => {
								const next = { ...drafts };
								delete next[i];
								return next;
							});
						}}
						onChange={(e) => {
							const valStr = e.target.value;
							const valInt = parseInt(valStr, 10);

							if (!isNaN(valInt)) onRegisterChange(reg, valInt);
							setDrafts((drafts) => ({ ...drafts, [i]: valStr }));
						}}
					/>
				</div>
				);
			})}
		</Card>
	);
}
