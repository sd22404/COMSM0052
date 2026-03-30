import Button from "@/app/components/button";
import Card from "@/app/components/card";
import StatusPill from "@/app/components/pill";
import { CoreState, GlobalState, Register } from "@/common/types";
import Editor from "./editor";
import Registers from "./registers";
import { useState } from "react";

interface CoreProps {
	coreId: number;
	core: CoreState;
	globalState: GlobalState;
	initialCode: string;
	onCodeChange: (code: string) => void;
	onRegisterChange: (register: Register, value: number) => void;
	onToggleCore: () => void;
}

export default function Core({
	coreId,
	core,
	globalState,
	initialCode,
	onCodeChange,
	onRegisterChange,
	onToggleCore,
}: CoreProps) {
	const bpmRatio = core.regs[Register.BPM] ?? 100;
	const volumeRatio = core.regs[Register.VOL] ?? 100;
	const effectiveBpm = Math.round((globalState.bpm * bpmRatio) / 100);
	const effectiveVolume = Math.round((globalState.volume * volumeRatio) / 100);
	const [load, setLoad] = useState(false);

	return (
		<Card variant="panel" className="flex h-full min-h-0 flex-col gap-3 p-3">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 flex-col gap-1">
					<div className="flex items-center gap-4">
						<h2 className="text-base font-bold text-ctp-text">Core {coreId}</h2>
						<StatusPill tone={core.active ? "active" : "idle"}>{core.active ? "active" : "idle"}</StatusPill>
					</div>
					{/* <SectionDescription className="text-xs">
						PC {core.pc.toString().padStart(2, "0")} · {bpmRatio}% BPM = {effectiveBpm} · {volumeRatio}% VOL = {effectiveVolume}
					</SectionDescription> */}
				</div>
				<div className="flex gap-1">
					<Button size="sm" variant={core.active ? "danger" : "secondary"} onClick={onToggleCore}>
						{core.active ? "Disable" : "Enable"}
					</Button>
					<Button size="sm" variant="primary" onClick={() => setLoad((current) => !current)}>
						Load
					</Button>
				</div>
			</div>
			<div className="flex h-full min-h-0 gap-6">
				<Editor initialCode={initialCode} onCodeChange={onCodeChange} loadTrigger={load} />
				<Registers registers={core.regs} onRegisterChange={onRegisterChange} />
			</div>
		</Card>
	);
}
