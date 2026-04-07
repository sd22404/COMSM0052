"use client";
import { Register, getDefaultCoreProgram } from "@/common/types";
import Memory from "./memory";
import Core from "./core";
import useRuntime from "../hooks/useRuntime";
import Controls from "./controls";

export default function Workspace() {
	const {
		runtime: {
			running,
			cpu: {
				memory,
				parameters,
				cores,
			},
			transport: {
				bpm,
				horizon,
			},
		},
		run,
		halt,
		reset,
		setCode,
		setRegister,
		setParameter,
		setMemory,
		toggleCore,
	} = useRuntime();

	return (
		<div className="flex h-screen w-screen items-start justify-between overflow-hidden gap-4 px-4 pb-4 pt-16">
			<div className="grid min-h-0 h-full flex-1 auto-rows-fr xl:grid-cols-2 gap-2">
				{cores.map((core) => (
					<Core
						key={core.id}
						state={core}
						initialCode={getDefaultCoreProgram(core.id)}
						onCodeChange={(code) => setCode(core.id, code)}
						onRegisterChange={(reg: Register, val: number) => setRegister(core.id, reg, val)}
						toggleCore={() => toggleCore(core.id)}
					/>
				))}
			</div>

			<div className="flex h-full w-xs flex-col gap-4">
				<Controls parameters={parameters} setParameter={setParameter} running={running} run={run} halt={halt} reset={reset} />
				<Memory memory={memory} onMemoryChange={setMemory} />
			</div>
		</div>
	);
}
