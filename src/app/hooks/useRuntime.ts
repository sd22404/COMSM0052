import { DEFAULT_RUNTIME_STATE, Runtime, RuntimeState } from "@/machine/runtime";
import { Compiler } from "@/language/compiler";
import { useEffect, useState } from "react";

interface RuntimeHook {
	runtime: RuntimeState;
	run: () => void;
	halt: () => void;
	setCode: (code: string) => void;
	// setRegister: (reg: number, value: number) => void;
	setMemory: (addr: number, value: number) => void;
}

export default function useRuntime(): RuntimeHook {
	const [runtime] = useState<Runtime>(new Runtime());
	const [compiler] = useState<Compiler>(new Compiler());
	const [state, setState] = useState<RuntimeState>(DEFAULT_RUNTIME_STATE);

	useEffect(() => {
		runtime.setBroadcast(setState);
	}, [runtime]);

	return {
		runtime: state,
		run: () => runtime.run(),
		halt: () => runtime.halt(),
		setCode: (code: string) => runtime.load(compiler.compile(code)),
		setMemory: (addr: number, value: number) => runtime.write(addr, value),
	}
}
