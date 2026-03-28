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
		this.broadcast?.({
			running: this.running,
			memory: [...this.memory.data],
			cores: this.cores.map(core => ({
				active: core.active,
				pc: core.pc,
				regs: [...core.regs],
			})),
		});
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
		this.notify();
	}

	write(addr: number, value: number) {
		this.memory.write(addr, value);
		this.notify();
	}

	toggleCore(index: number) {
		if (index < 0 || index >= this.cores.length) return;
		this.cores[index].active = !this.cores[index].active;
		this.notify();
	}
}
