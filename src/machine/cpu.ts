import { CPUState, ExecEvent, Parameter, Program, Register } from "@/common/types";
import { AccessLog } from "./log";
import { Core, createDefaultCore } from "./core";
import { Memory, createDefaultMemory } from "./memory";

const CORE_COUNT = 4;
const MEMORY_SIZE = 32;

export function createDefaultCPU(): CPUState {
	return {
		memory: createDefaultMemory(MEMORY_SIZE),
		parameters: createDefaultParameters(),
		cores: Array.from({ length: CORE_COUNT }, (_, id) => createDefaultCore(id)),
	};
}

export function createDefaultParameters(): number[] {
	return [120, 100];
}

export class CPU {
	constructor(coreCount: number = CORE_COUNT) {
		this.parameters = createDefaultParameters();
		this.cores = Array.from({ length: coreCount }, (_, id) => new Core({
			id,
			log: this.log,
			memory: this.memory,
			parameters: this.parameters,
		}));
	}

	private readonly parameters: number[];
	private readonly log = new AccessLog();
	private readonly memory = new Memory(MEMORY_SIZE, this.log);
	private readonly cores: Core[] = [];

	get state(): CPUState {
		return {
			memory: this.memory.snapshot(),
			parameters: [...this.parameters],
			cores: this.cores.map((core) => core.state),
		};
	}

	public setEnabled(coreID: number, enabled: boolean, startTick?: number) {
		const core = this.cores[coreID];
		if (!core) return;
		core.setEnabled(enabled, startTick);
	}

	public load(coreID: number, program: Program, startTick?: number) {
		const core = this.cores[coreID];
		if (!core) return;
		core.load(program, startTick);
	}

	private nextCore(targetTick: number): Core | undefined {
		let next: Core | undefined;

		for (const core of this.cores) {
			if (!core.enabled || core.fault || !core.hasProgram || core.tick >= targetTick)
				continue;

			if (!next || core.tick < next.tick)
				next = core;
		}

		return next;
	}

	public execUntil(targetTick: number) {
		this.log.clear();
		const events: ExecEvent[] = [];

		while (true) {
			const core = this.nextCore(targetTick);
			if (!core) break;

			const event = core.step();
			if (!event) continue;
			events.push(event);
		}

		return events;
	}

	public setParameter(param: Parameter, value: number) {
		this.parameters[param] = value;
	}

	public setAddress(addr: number, value: number) {
		this.memory.write(addr, value);
	}

	public setRegister(coreID: number, register: Register, value: number) {
		const core = this.cores[coreID];
		if (!core) return;
		core.setRegister(register, value);
	}

	public reset() {
		this.memory.reset();
		for (const [index, value] of createDefaultParameters().entries())
			this.parameters[index] = value;

		for (const core of this.cores)
			core.reset();

		this.log.clear();
	}
}
