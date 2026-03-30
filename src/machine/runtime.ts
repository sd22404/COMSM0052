import { CORE_COUNT, GlobalState, Memory, NoteEvent, Program, Register, RuntimeState, createDefaultGlobalState } from "@/common/types";
import { Core } from "@/machine/cpu";
import { Sequencer } from "@/machine/sequencer";

export class Runtime {
	constructor() {
		this.global_state = createDefaultGlobalState();
		this.memory = new Memory();
		this.sequencer = new Sequencer(this.event_q);
		this.cores = Array.from({ length: CORE_COUNT }, (_, id) => new Core({
			id: id,
			event_q: this.event_q,
			memory: this.memory,
			global_state: this.global_state,
			onChange: () => this.notify(),
		}));
		this.cores[0].active = true;
	}

	private running = false;
	private readonly event_q: NoteEvent[] = [];
	private readonly cores: Core[];
	private readonly global_state: GlobalState;
	private readonly memory: Memory;
	private readonly sequencer: Sequencer;
	private broadcast?: (state: RuntimeState) => void;

	private snapshotState(): RuntimeState {
		return {
			running: this.running,
			globals: { ...this.global_state },
			memory: this.memory.snapshot(),
			cores: this.cores.map((core) => core.state),
		};
	}

	setBroadcast(fn: (state: RuntimeState) => void) {
		this.broadcast = fn;
		this.notify();
	}

	private notify() {
		this.broadcast?.(this.snapshotState());
	}

	run() {
		if (this.running) return;
		this.running = true;
		this.sequencer.run();
		this.cores.forEach((core) => core.run());
		this.notify();
	}

	halt() {
		if (!this.running) return;
		this.running = false;
		this.sequencer.halt();
		this.cores.forEach((core) => core.halt());
		this.notify();
	}

	reset() {
		this.halt();
		this.memory.reset();
		Object.assign(this.global_state, createDefaultGlobalState());
		this.cores.forEach((core) => core.reset());
		this.notify();
	}

	load(coreId = 0, program: Program) {
		const core = this.cores[coreId];
		if (!core) return;
		core.load(program);
		this.notify();
	}

	setAddress(addr: number, value: number) {
		this.memory.write(addr, value);
		this.notify();
	}

	setRegister(coreId: number, register: Register, value: number) {
		const core = this.cores[coreId];
		if (!core) return;
		core.setRegister(register, value);
		this.notify();
	}

	setGlobalControl(control: keyof GlobalState, value: number) {
		this.global_state[control] = value;
		// TODO: cleanly handle bpm changes
		this.notify();
	}

	toggleCore(index: number) {
		const core = this.cores[index];
		if (!core) return;
		core.active = !core.active;
		if (this.running && core.active) core.run();
		this.notify();
	}
}
