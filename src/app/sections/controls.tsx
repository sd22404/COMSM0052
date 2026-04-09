import Button from "@/app/components/button";
import Card from "@/app/components/card";
import Input from "@/app/components/input";
import { Body, Subheading } from "@/app/components/text";
import { Parameter } from "@/common/types";
import { useState } from "react";

interface ControlsProps {
	parameters: number[];
	setParameter: (param: Parameter, value: number) => void;
	running: boolean;
	run: () => void;
	halt: () => void;
	reset: () => void;
}

export default function Controls({ parameters, setParameter, running, run, halt, reset }: ControlsProps){
	const [drafts, setDrafts] = useState<(number | string)[]>(parameters);

	return (
		<Card variant="panel" className="flex flex-col gap-3">
			<Subheading>Master Controls</Subheading>

			<div className="flex justify-between">
				{drafts.map((value, i) => (
					<div key={i} className="flex items-center gap-4">
						<Body className="text-xl font-semibold text-ctp-teal">
							{Parameter[i]}
						</Body>
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
	

			<div className="grid grid-cols-2 gap-2">
				<Button variant={running ? "danger" : "primary"} onClick={running ? halt : run}>
					{running ? "Stop Audio" : "Start Audio"}
				</Button>
				<Button variant="secondary" onClick={reset}>
					Reset
				</Button>
			</div>
		</Card>
	)
}
