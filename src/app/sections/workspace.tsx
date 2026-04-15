import { Register } from "@/common/types";
import { useEffect, useRef } from "react";
import useRuntime from "../hooks/useRuntime";
import useStorage from "../hooks/useStorage";
import useTutorial from "../hooks/useTutorial";
import Controls from "./controls";
import Core from "./core";
import Memory from "./memory";
import SampleSelector from "./sampler";
import Tutorial from "./tutorial";

export default function Workspace() {
	const {
		state: {
			running,
			cpu,
			highlights,
			samples,
		},
		run,
		halt,
		reset,
		load,
		setRegister,
		setEnabled,
		setParameter,
		setMemory,
		setSample,
	} = useRuntime();

	const {
		isClient,
		storeCode,
		retrieveCode,
	} = useStorage();

	const {
		state: tutorial,
		next,
	} = useTutorial();
	const coreIDs = useRef(cpu.cores.map((core) => core.id));
	const loadRef = useRef(load);

	useEffect(() => {
		loadRef.current = load;
	}, [load]);

	function handleLoad(coreID: number, code: string) {
		const asm = load(coreID, code);
		if (!asm.program) return asm;

		storeCode(coreID, code);
		setEnabled(coreID, true);
		run(); return asm;
	}

	useEffect(() => {
		if (!isClient) return;
		coreIDs.current.forEach((coreID) => {
			loadRef.current(coreID, retrieveCode(coreID));
		});
	}, [isClient, retrieveCode]);

	return (
		<div id="workspace" className="flex h-screen w-screen items-start justify-between gap-4 overflow-hidden px-4 pb-4 pt-16">
			{tutorial.active && <Tutorial lesson={tutorial.lesson} next={next} />}
			<div id="cores" className="grid h-full min-h-0 flex-1 auto-rows-fr gap-2 xl:grid-cols-2">
				{cpu.cores.map((state) => (
					<Core
						key={state.id}
						state={state}
						initialCode={retrieveCode(state.id)}
						codeHighlights={highlights.code[state.id] ?? []}
						regHighlights={highlights.regs[state.id] ?? []}
						onRegisterChange={(reg: Register, val: number) => setRegister(state.id, reg, val)}
						onEnable={(enabled) => setEnabled(state.id, enabled)}
						onLoad={(code) => handleLoad(state.id, code)}
					/>
				))}
			</div>

			<div className="flex h-full w-sm flex-col gap-2">
				<Controls
					parameters={cpu.parameters}
					onParameterChange={setParameter}
					running={running}
					run={run}
					halt={halt}
					reset={reset}
				/>
				<Memory memory={cpu.memory} highlights={highlights.memory} onMemoryChange={setMemory} />
				<SampleSelector samples={samples} onSampleChange={setSample} />
			</div>
		</div>
	);
}
