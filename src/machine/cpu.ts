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
	return [ 120, 100 ]; // BPM, Volume
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
			cores: this.cores.map(core => core.state),
		};
	}

	public toggleCore(index: number) {
		this.cores[index].toggle(); // TODO: toggle on downbeat
	}

	public load(coreID: number, program: Program) {
		const core = this.cores[coreID];
		if (!core) return;
		core.load(program);
	}

	public execUntil(beat: number) {
		this.log.clear();
		const events: ExecEvent[] = [];
		for (const core of this.cores)
			if (core.enabled) events.push(...core.execUntil(beat));

		events.sort((left, right) => (
			left.beat - right.beat
			|| left.coreID - right.coreID
			|| left.id - right.id
		));

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
		// this.memory.reset();
		for (const core of this.cores) core.reset();
		this.log.clear();
	}
}
