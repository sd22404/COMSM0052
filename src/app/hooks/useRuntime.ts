import { Runtime } from "@/machine/runtime";
import { Compiler } from "@/language/compiler";
import { GlobalState, Register, RuntimeState, createDefaultRuntimeState } from "@/common/types";
import { useEffect, useState } from "react";

interface RuntimeHook {
	runtime: RuntimeState;
	run: () => void;
	halt: () => void;
	reset: () => void;
	setCode: (coreId: number, code: string) => void;
	setRegister: (coreId: number, reg: Register, value: number) => void;
	setGlobalControl: (control: keyof GlobalState, value: number) => void;
	setMemory: (addr: number, value: number) => void;
	toggleCore: (index: number) => void;
}

export default function useRuntime(): RuntimeHook {
	const [runtime] = useState(() => new Runtime());
	const [compiler] = useState(() => new Compiler());
	const [state, setState] = useState<RuntimeState>(createDefaultRuntimeState);

	useEffect(() => {
		runtime.setBroadcast(setState);
	}, [runtime]);

	return {
		runtime: state,
		run: () => runtime.run(),
		halt: () => runtime.halt(),
		reset: () => runtime.reset(),
		setCode: (coreId: number, code: string) => runtime.load(coreId, compiler.compile(code)),
		setRegister: (coreId: number, reg: Register, value: number) => runtime.setRegister(coreId, reg, value),
		setGlobalControl: (control: keyof GlobalState, value: number) => runtime.setGlobalControl(control, value),
		setMemory: (addr: number, value: number) => runtime.setAddress(addr, value),
		toggleCore: (id: number) => runtime.toggleCore(id),
	};
}
