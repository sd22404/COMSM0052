import { Runtime, createDefaultRuntime } from "@/runtime/runtime";
import { Parameter, Register, RuntimeState } from "@/common/types";
import { useEffect, useState } from "react";

interface RuntimeHook {
	runtime: RuntimeState;
	run: () => void;
	halt: () => void;
	reset: () => void;
	load: (coreID: number, code: string) => void;
	setRegister: (coreID: number, reg: Register, value: number) => void;
	setParameter: (control: Parameter, value: number) => void;
	setMemory: (addr: number, value: number) => void;
	setSample: (note: number, sample: string) => void;
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
		load: (coreID: number, code: string) => runtime.load(coreID, code),
		setRegister: (coreID: number, reg: Register, value: number) => runtime.setRegister(coreID, reg, value),
		setParameter: (param: Parameter, value: number) => runtime.setParameter(param, value),
		setMemory: (addr: number, value: number) => runtime.setAddress(addr, value),
		setSample: (note: number, sample: string) => runtime.setSample(note, sample),
		toggleCore: (id: number) => runtime.toggleCore(id),
	};
}
