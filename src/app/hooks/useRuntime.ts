import { Runtime } from "@/machine/runtime";
import { RuntimeState } from "@/common/types";
import { Compiler } from "@/language/compiler";
import { useEffect, useState } from "react";

interface RuntimeHook {
	runtime: RuntimeState;
	run: () => void;
	halt: () => void;
	setCode: (code: string) => void;
	// setRegister: (reg: number, value: number) => void;
	setMemory: (addr: number, value: number) => void;
	toggleCore: (index: number) => void;
}

export default function useRuntime(): RuntimeHook {
	const [runtime] = useState<Runtime>(new Runtime());
	const [compiler] = useState<Compiler>(new Compiler());
	const [state, setState] = useState<RuntimeState>({
		running: false,
		memory: new Array(128).fill(0),
		cores: new Array(8).fill(null).map(() => ({
			active: false,
			pc: 0,
			regs: new Array(4).fill(0),
		})),
	});

	useEffect(() => {
		runtime.setBroadcast(setState);
	}, [runtime]);

	return {
		runtime: state,
		run: () => runtime.run(),
		halt: () => runtime.halt(),
		setCode: (code: string) => runtime.load(compiler.compile(code)),
		setMemory: (addr: number, value: number) => runtime.write(addr, value),
		toggleCore: (index: number) => runtime.toggleCore(index),
	}
}
