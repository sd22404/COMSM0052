import { Memory, NoteEvent, Program } from "@/common/types";
import { Core } from "@/machine/cpu";
import { Sequencer } from "@/machine/sequencer";
import { useState } from "react";

interface CoreState {
	pc: number;
	regs: number[];
}

export interface RuntimeState {
	running: boolean;
	memory: number[];
	cores: CoreState[];
}

const DEFAULT_CORE_STATE: CoreState = {
	pc: 0,
	regs: new Array(4).fill(0),
};

export const DEFAULT_RUNTIME_STATE: RuntimeState = {
	running: false,
	memory: new Array(128).fill(0),
	cores: new Array(8).fill(DEFAULT_CORE_STATE),
};

export class Runtime {
	constructor() {
		this.memory = new Memory();
		this.sequencer = new Sequencer(this.event_q);
		this.cores = Array.from({ length: 8 }, () => new Core(this.event_q, this.memory));
		this.cores[0].enable();
	};

	private state: RuntimeState = DEFAULT_RUNTIME_STATE;
	private event_q: NoteEvent[] = [];
	private clock: number = 0;
	private cores: Core[];
	private memory: Memory;
	private sequencer: Sequencer;
	private broadcast?: (state: RuntimeState) => void;

	setBroadcast(fn: (state: RuntimeState) => void) {
		this.broadcast = fn;
		this.notify();
	}

	private notify() {
		this.broadcast?.({ ...this.state });
	}

	run() {
		if (this.state.running) return;
		this.state.running = true;
		this.sequencer.run();
		this.cores.forEach(core => core.run());
		this.notify();
	}

	halt() {
		if (!this.state.running) return;
		this.state.running = false;
		this.sequencer.halt();
		this.cores.forEach(core => core.halt());
		this.notify();
	}

	load(program: Program) {
		this.cores[0].load(program); // address to core !!!
		this.notify();
	}

	write(addr: number, value: number) {
		this.memory.write(addr, value);
		this.notify();
	}
}
