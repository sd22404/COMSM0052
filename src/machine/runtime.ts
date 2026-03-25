import { Memory, NoteEvent, Program, RuntimeState, CoreState } from "@/common/types";
import { Core } from "@/machine/cpu";
import { Sequencer } from "@/machine/sequencer";

export class Runtime {
	constructor() {
		this.memory = new Memory();
		this.sequencer = new Sequencer(this.event_q);
		this.cores = Array.from({ length: 8 }, () => new Core(this.event_q, this.memory));
		this.cores[0].active = true;
	};

	private state!: RuntimeState;
	private running: boolean = false;
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
		if (this.running) return;
		this.running = true;
		this.sequencer.run();
		this.cores.forEach(core => core.run());

		this.notify();
	}

	halt() {
		if (!this.running) return;
		this.running = false;
		this.sequencer.halt();
		this.cores.forEach(core => core.halt());

		this.notify();
	}

	load(program: Program) {
		this.cores[0].load(program); // address to core !!!
	}

	write(addr: number, value: number) {
		this.memory.write(addr, value);
	}

	toggleCore(index: number) {
		if (index < 0 || index >= this.cores.length) return;
		this.cores[index].active = !this.cores[index].active;
		console.log(`Toggled core ${index} to ${this.cores[index].active}`);
	}
}
