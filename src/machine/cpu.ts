import { CPUState, MusicEvent, Parameter, Program, Register } from "@/common/types";
import { Core } from "./core";
import { CPUClock, createDefaultClock } from "./clock";
import { Memory, createDefaultMemory } from "./memory";
import { createDefaultRegisters } from "./regfile";

const CORE_COUNT = 4;

export function createDefaultCPU(): CPUState {
	return {
		memory: createDefaultMemory(),
		parameters: createDefaultParameters(),
		clock: createDefaultClock(),
		cores: Array.from({ length: CORE_COUNT }, (_, id) => ({
			id: id,
			pc: 0,
			beat: 0,
			regs: createDefaultRegisters(),
			enabled: false,
		})),
	};
}

export function createDefaultParameters(): number[] {
	return [ 120, 100 ]; // BPM, Volume
}

export class CPU {
	constructor(coreCount: number = CORE_COUNT, timeline: MusicEvent[]) {
		this.parameters = createDefaultParameters();
		this.timeline = timeline;
		this.clock = new CPUClock(undefined, (beat) => this.pulse(beat));
		this.cores = Array.from({ length: coreCount }, (_, id) => new Core({
			id,
			memory: this.memory,
			parameters: this.parameters,
		}));
		this.toggleCore(0);
	}

	private readonly parameters: number[];
	private readonly clock: CPUClock;
	private memory = new Memory();
	private cores: Core[] = [];
	private readonly timeline: MusicEvent[];

	get state(): CPUState {
		return {
			memory: this.memory.snapshot(),
			parameters: [...this.parameters],
			clock: this.clock.state,
			cores: this.cores.map(core => core.state),
		};
	}

	get bpm() {
		return this.clock.bpm;
	}

	public toggleCore(index: number) {
		this.cores[index].toggle(); // TODO: toggle on downbeat
	}

	public load(coreId: number, program: Program) {
		const core = this.cores[coreId];
		if (!core) return;
		core.load(program);
	}

	public pulse(beat: number) {
		console.log(this.timeline);
		for (const core of this.cores) {
			if (core.enabled) this.timeline.push(...core.runUntil(beat));
		}
	}

	public setParameter(param: Parameter, value: number) {
		this.parameters[param] = value;
	}

	public setAddress(addr: number, value: number) {
		this.memory.write(addr, value);
	}

	public setRegister(coreId: number, register: Register, value: number) {
		const core = this.cores[coreId];
		if (!core) return;
		core.setRegister(register, value);
	}

	public start() {
		this.clock.start();
	}

	public stop() {
		this.clock.stop();
	}

	public reset() {
		this.clock.reset();
		this.memory.reset();
		for (const core of this.cores) core.reset();
	}
}
