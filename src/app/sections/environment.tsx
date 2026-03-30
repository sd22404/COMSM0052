import Button from "@/app/components/button";
import Card from "@/app/components/card";
import Input from "@/app/components/input";
import { Eyebrow, SectionTitle } from "@/app/components/text";
import { GlobalState, Register } from "@/common/types";
import Help from "./help";
import Memory from "./memory";
import Core from "./core";
import useRuntime from "../hooks/useRuntime";
import { useState } from "react";

const CORE_PROGRAMS = [
	`; Core 0: lead synth
LOAD BPM 100
LOAD VOL 82
LOAD ATTACK 20
LOAD DECAY 180
LOAD SUSTAIN 60
LOAD RELEASE 240

loop:
PLAY SYNTH 60
REST 1
PLAY SYNTH 64
REST 1
PLAY SYNTH 67
REST 1
PLAY SYNTH 72
REST 1
JUMP loop`,
	`; Core 1: drums
LOAD BPM 100
LOAD VOL 88
LOAD PAN -10

loop:
PLAY DRUMS 58
REST 1
PLAY DRUMS 60
REST 1
PLAY DRUMS 59
REST 1
PLAY DRUMS 60
REST 1
JUMP loop`,
	`; Core 2: bass
LOAD BPM 100
LOAD VOL 72
LOAD DECAY 120
LOAD SUSTAIN 55
LOAD RELEASE 180

loop:
PLAY BASS 36
REST 2
PLAY BASS 43
REST 2
JUMP loop`,
	`; Core 3: pan test
LOAD BPM 75
LOAD VOL 65
LOAD PAN 35
LOAD ATTACK 10
LOAD DECAY 90
LOAD SUSTAIN 45
LOAD RELEASE 200

loop:
PLAY PIANO 72
REST 2
PLAY PIANO 76
REST 2
JUMP loop`,
];

const GLOBAL_CONTROLS: Array<{
	control: keyof GlobalState;
	description: string;
	label: string;
	max: number;
	min: number;
	step: number;
}> = [
	{ control: "bpm", description: "Shared tempo all cores sync to.", label: "BPM", min: 30, max: 240, step: 1 },
	{ control: "volume", description: "Shared volume before per-core ratios.", label: "VOL", min: 0, max: 100, step: 1 },
];

function getDefaultCoreProgram(coreId: number) {
	return CORE_PROGRAMS[coreId] ?? `; Core ${coreId}
; Press Ctrl+Enter or Load Core to assign this program.
LOAD BPM 100
LOAD VOL 100

loop:
REST 1
JUMP loop`;
}

export default function Environment() {
	const {
		runtime: { running, globals, memory, cores },
		run,
		halt,
		reset,
		setCode,
		setRegister,
		setGlobalControl,
		setMemory,
		toggleCore,
	} = useRuntime();
	const [globalDrafts, setGlobalDrafts] = useState<Partial<Record<keyof GlobalState, string>>>({});
	const activeCores = cores.filter((core) => core.active).length;

	return (
		<div className="flex h-screen w-screen items-start justify-between overflow-hidden gap-4 px-4 pb-4 pt-16">
			<div className="grid min-h-0 h-full flex-1 grid-cols-2 gap-2">
				{cores.map((core, coreId) => (
					<Core
						key={coreId}
						coreId={coreId}
						core={core}
						globalState={globals}
						initialCode={getDefaultCoreProgram(coreId)}
						onCodeChange={(code) => setCode(coreId, code)}
						onRegisterChange={(register: Register, value: number) => setRegister(coreId, register, value)}
						onToggleCore={() => toggleCore(coreId)}
					/>
				))}
			</div>

			<div className="flex h-full w-xs flex-col gap-3">
				<Card variant="panel" className="flex flex-col gap-3 p-4">
					<SectionTitle>Runtime</SectionTitle>

					<div className="grid gap-2">
						{GLOBAL_CONTROLS.map((field) => {
							const rawValue = globalDrafts[field.control] ?? globals[field.control].toString();

							return (
								<label key={field.control} className="grid gap-1" title={field.description}>
									<div className="flex items-center justify-between gap-2 text-[11px]">
										<span className="font-semibold text-ctp-text">{field.label}</span>
										<span className="text-ctp-overlay0">{field.min}-{field.max}</span>
									</div>
									<Input
										type="number"
										min={field.min}
										max={field.max}
										step={field.step}
										value={rawValue}
										onChange={(event) => {
											const nextValue = event.target.value;
											const parsed = Number.parseInt(nextValue, 10);

											if (Number.isNaN(parsed)) {
												setGlobalDrafts((current) => ({ ...current, [field.control]: nextValue }));
												return;
											}

											setGlobalControl(field.control, parsed);
											setGlobalDrafts((current) => {
												const nextDrafts = { ...current };
												delete nextDrafts[field.control];
												return nextDrafts;
											});
										}}
									/>
								</label>
							);
						})}
					</div>

					<div className="grid gap-2">
						<Button variant={running ? "danger" : "primary"} onClick={running ? halt : run}>
							{running ? "Stop Audio" : "Start Audio"}
						</Button>
						<Button variant="secondary" onClick={reset}>
							Reset Runtime
						</Button>
						<Help />
					</div>
				</Card>
				
				<Card variant="panel" className="flex-1 min-h-0 p-4">
					<Memory memory={memory} onMemoryChange={setMemory} />
				</Card>
			</div>
		</div>
	);
}
