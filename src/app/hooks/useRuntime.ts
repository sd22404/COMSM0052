import { Runtime, createDefaultRuntime } from "@/runtime/runtime";
import { CompileResult, Parameter, Register, RuntimeState } from "@/common/types";
import { useCallback, useEffect, useMemo, useState } from "react";

interface RuntimeHook {
	state: RuntimeState;
	run: () => void;
	halt: () => void;
	reset: () => void;
	load: (coreID: number, code: string) => CompileResult;
	setRegister: (coreID: number, reg: Register, value: number) => void;
	setParameter: (control: Parameter, value: number) => void;
	setMemory: (addr: number, value: number) => void;
	setSample: (note: number, sample: string) => void;
	setEnabled: (coreID: number, enabled: boolean) => void;
}

export default function useRuntime(): RuntimeHook {
	const [runtime] = useState(() => new Runtime());
	const [state, setState] = useState<RuntimeState>(createDefaultRuntime);

	useEffect(() => {
		runtime.setBroadcast(setState);
		return () => runtime.halt();
	}, [runtime]);

	const run = useCallback(() => runtime.run(), [runtime]);
	const halt = useCallback(() => runtime.halt(), [runtime]);
	const reset = useCallback(() => runtime.reset(), [runtime]);
	const load = useCallback((coreID: number, code: string) => runtime.load(coreID, code), [runtime]);
	const setRegister = useCallback((coreID: number, reg: Register, value: number) => runtime.setRegister(coreID, reg, value), [runtime]);
	const setParameter = useCallback((param: Parameter, value: number) => runtime.setParameter(param, value), [runtime]);
	const setMemory = useCallback((addr: number, value: number) => runtime.setAddress(addr, value), [runtime]);
	const setSample = useCallback((note: number, sample: string) => runtime.setSample(note, sample), [runtime]);
	const setEnabled = useCallback((coreID: number, enabled: boolean) => runtime.setEnabled(coreID, enabled), [runtime]);

	return useMemo(() => ({
		state,
		run,
		halt,
		reset,
		load,
		setRegister,
		setParameter,
		setMemory,
		setSample,
		setEnabled,
	}), [halt, load, reset, run, setEnabled, setMemory, setParameter, setRegister, setSample, state]);
}
