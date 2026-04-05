import Button from "@/app/components/button";
import Card from "@/app/components/card";
import Input from "@/app/components/input";
import { Body, Subheading } from "@/app/components/text";
import { Parameter } from "@/common/types";
import Help from "./help";
import { useState } from "react";

export default function Controls({
	parameters,
	setParameter,
	running,
	run,
	halt,
	reset,
}: {
	parameters: number[];
	setParameter: (param: Parameter, value: number) => void;
	running: boolean;
	run: () => void;
	halt: () => void;
	reset: () => void;
}){
	const [drafts, setDrafts] = useState<(number | string)[]>(parameters);

	return (
		<Card variant="panel" className="flex flex-col gap-3 p-4">
			<Subheading>Master Controls</Subheading>

			<div className="flex justify-between">
			{drafts.map((value, i) => (
				<div key={i} className="flex items-center gap-4">
					<Body className="text-xl font-semibold text-ctp-teal">{Parameter[i]}</Body>
					<Input
						className="w-20 text-xl"
						type="number"
						min={i === Parameter.VOL ? 0 : 1}
						max={i === Parameter.VOL ? 100 : 300}
						value={value}
						onChange={(e) => {
							const valStr = e.target.value;
							const valInt = parseInt(valStr);

							if (!isNaN(valInt)) setParameter(i, valInt);
							setDrafts(drafts => drafts.map((control, j) => j === i ? valStr : control));
						}}
					/>
				</div>
			))}
			</div>
	

			<div className="grid gap-2">
				<Button variant={running ? "danger" : "primary"} onClick={running ? halt : run}>
					{running ? "Stop Audio" : "Start Audio"}
				</Button>
				<Button variant="secondary" onClick={reset}>
					Reset Controls
				</Button>
				<Help />
			</div>
		</Card>
	)
}
