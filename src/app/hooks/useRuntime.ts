import { Runtime, createDefaultRuntime } from "@/machine/runtime";
import { Parameter, Register, RuntimeState } from "@/common/types";
import { useEffect, useState } from "react";

interface RuntimeHook {
	runtime: RuntimeState;
	run: () => void;
	halt: () => void;
	reset: () => void;
	setCode: (coreId: number, code: string) => void;
	setRegister: (coreId: number, reg: Register, value: number) => void;
	setParameter: (control: Parameter, value: number) => void;
	setMemory: (addr: number, value: number) => void;
	toggleCore: (index: number) => void;
}

export default function useRuntime(): RuntimeHook {
	const [runtime] = useState(() => new Runtime());
	const [state, setState] = useState<RuntimeState>(createDefaultRuntime);

	useEffect(() => {
		runtime.setBroadcast(setState);
		return () => runtime.halt();
	}, [runtime]);

	return {
		runtime: state,
		run: () => runtime.run(),
		halt: () => runtime.halt(),
		reset: () => runtime.reset(),
		setCode: (coreId: number, code: string) => runtime.load(coreId, code),
		setRegister: (coreId: number, reg: Register, value: number) => runtime.setRegister(coreId, reg, value),
		setParameter: (param: Parameter, value: number) => runtime.setParameter(param, value),
		setMemory: (addr: number, value: number) => runtime.setAddress(addr, value),
		toggleCore: (id: number) => runtime.toggleCore(id),
	};
}
