import { MusicEvent, Parameter, Register, RuntimeState } from "@/common/types";
import { CPU, createDefaultCPU } from "@/machine/cpu";
import { Scheduler, createDefaultScheduler } from "@/machine/scheduler";
import { Assembler } from "@/language/assembler";

export function createDefaultRuntime() {
	return {
		running: false,
		cpu: createDefaultCPU(),
		scheduler: createDefaultScheduler(),
	}
}

export class Runtime {
	constructor() {
		this.cpu = new CPU(undefined, this.timeline);
		this.scheduler = new Scheduler(undefined, this.timeline);
	}

	private running = false;
	private readonly cpu: CPU;
	private readonly scheduler: Scheduler;
	private timeline: MusicEvent[] = [];
	private broadcast?: (state: RuntimeState) => void;

	get state(): RuntimeState {
		return {
			running: this.running,
			cpu: this.cpu.state,
			scheduler: this.scheduler.state,
		};
	}

	setBroadcast(fn: (state: RuntimeState) => void) {
		this.broadcast = fn;
		this.notify();
	}

	private notify() {
		this.broadcast?.(this.state);
	}

	run() {
		if (this.running) return;
		this.running = true;
		this.cpu.start();
		this.scheduler.start();
		this.notify();
	}

	halt() {
		if (!this.running) return;
		this.running = false;

		this.cpu.stop();
		this.scheduler.stop();
		this.notify();
	}

	reset() {
		this.halt();
		this.cpu.reset();
		this.scheduler.reset();
		this.notify();
	}

	load(coreId = 0, code: string) {
		const program = Assembler.assemble(code);
		this.cpu.load(coreId, program);
		this.notify();
	}

	setAddress(addr: number, value: number) {
		this.cpu.setAddress(addr, value);
		this.notify();
	}

	setRegister(coreId: number, register: Register, value: number) {
		this.cpu.setRegister(coreId, register, value);
		this.notify();
	}

	setParameter(param: Parameter, value: number) {
		this.cpu.setParameter(param, value);
		// if (param === Parameter.BPM) this.scheduler.setBpm(value); // ???
		this.notify();
	}

	toggleCore(id: number) {
		this.cpu.toggleCore(id);
		this.notify();
	}
}
