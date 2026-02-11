import { useRef, useState } from "react";
import { Sequencer } from "@/runtime/sequencer";
import { AudioEngine } from "@/audio/engine";
import { compile } from "@/language/compiler";

interface RuntimeAPI {
	running: boolean;
	run: () => void;
	halt: () => void;
	setCode: (code: string) => void;
}

export default function useRuntime(): RuntimeAPI {
	const sequencerRef = useRef<Sequencer | null>(null);
	const audioEngineRef = useRef(new AudioEngine());
	const [running, setRunning] = useState(false);

	const run = () => {
		if (sequencerRef.current) {
			setRunning(true);
			sequencerRef.current.run();
		}
	};

	const halt = () => {
		if (sequencerRef.current) {
			sequencerRef.current.halt();
			setRunning(false);
		}
	};

	const setCode = (code: string) => {
		const program = compile(code);
		if (!sequencerRef.current) {
			sequencerRef.current = new Sequencer(program, audioEngineRef);
		} else {
			sequencerRef.current.program = program;
		}
	};

	return {
		running,
		run,
		halt,
		setCode,
	};
}
