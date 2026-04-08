import { CPUState, NoteEvent, Parameter, Program, Register } from "@/common/types";
import { Core, createDefaultCore } from "./core";
import { Memory, createDefaultMemory } from "./memory";

const CORE_COUNT = 4;

export function createDefaultCPU(): CPUState {
	return {
		memory: createDefaultMemory(),
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
			memory: this.memory,
			parameters: this.parameters,
		}));
	}

	private readonly parameters: number[];
	private memory = new Memory();
	private cores: Core[] = [];

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

	public renderUntil(beat: number) {
		const events: NoteEvent[] = [];
		for (const core of this.cores)
			if (core.enabled) events.push(...core.renderUntil(beat));

		events.sort((left, right) => (
			left.beat - right.beat
			|| left.coreID - right.coreID
			|| Number(left.id.split(":").at(1)) - Number(right.id.split(":").at(1))
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
	}
}
