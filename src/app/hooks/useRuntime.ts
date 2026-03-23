import { useEffect, useState } from "react";
import { compile } from "@/language/compiler";
import { Register } from "@/core/types";
import { Sequencer, SequencerState } from "@/runtime/sequencer";

export default function useRuntime() {
	const [seq] = useState<Sequencer>(() => new Sequencer());
	const [state, setState] = useState<SequencerState>(seq.state);

	useEffect(() => {
		const unsubscribe = seq.subscribe(setState);
		return unsubscribe;
	}, [seq]);

	return {
		running: state.running,
		registers: state.registers,
		memory: state.memory,
		highlights: state.highlights,
		run: () => seq.run(),
		halt: () => seq.halt(),
		setCode: (code: string) => seq.setTracks(compile(code)),
		setRegister: (reg: Register, val: number) => seq.setRegister(reg, val),
		setAddress: (addr: number, val: number) => seq.setAddress(addr, val),
	};
}
