import { useEffect, useRef, useState } from "react";
import { Sequencer, SequencerState } from "@/runtime/sequencer";
import { AudioEngine } from "@/audio/engine";
import { compile } from "@/language/compiler";
import { Register } from "@/core/types";

export default function useRuntime() {
	const seqRef = useRef<Sequencer | null>(null);
	if (!seqRef.current) seqRef.current = new Sequencer(new AudioEngine());

	const seq = seqRef.current;
	const [state, setState] = useState<SequencerState>(seq.state);

	useEffect(() => {
		seq.onStateChange = setState;
	}, [seq]);

	return {
		running: state.running,
		registers: state.registers,
		memory: state.memory,
		run: () => seq.run(),
		halt: () => seq.halt(),
		setCode: (code: string) => seq.setProgram(compile(code)),
		setRegister: (reg: Register, val: number) => seq.setRegister(reg, val),
		setMemory: (addr: number, val: number) => seq.setMemory(addr, val),
	};
}
