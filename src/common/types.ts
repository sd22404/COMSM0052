export const MEMORY_SIZE = 32;
export const CORE_COUNT = 4;

export enum Opcode {
	NOP, PLAY, REST, LOAD, STORE, ADD, JUMP, JMPZ,
}

export enum Register {
	BPM, VOL, PAN, ATK, DEC, SUS, REL, REG0, REG1, REG2, REG3,
}

export enum Instrument {
	SYNTH, DRUMS, BASS, PIANO,
}

export type Operand =
	| { mode: "imm"; value: number }
	| { mode: "reg"; reg: Register }
	| { mode: "mem_direct"; address: number }
	| { mode: "mem_indirect"; reg: Register }
	| { mode: "label"; value: string }
	| { mode: "instrument"; value: Instrument };

export interface Instruction {
	line: number;
	opcode: Opcode;
	operands: Operand[];
}

export interface Program {
	instrs: Instruction[];
	labels: Record<string, number>;
}

export class Memory {
	constructor(private readonly size: number = MEMORY_SIZE) {
		this.mem = new Array(size).fill(0);
	}

	private mem: number[];

	snapshot() {
		return [...this.mem];
	}

	reset() {
		this.mem.fill(0);
	}

	private normalizeAddress(addr: number) {
		if (this.size <= 0) return 0;
		const normalized = Math.trunc(addr);
		return ((normalized % this.size) + this.size) % this.size;
	}

	read(addr: number): number {
		return this.mem[this.normalizeAddress(addr)];
	}

	write(addr: number, value: number) {
		this.mem[this.normalizeAddress(addr)] = value;
	}
}

export function createDefaultRegisters(): number[] {
	return [
		120, // BPM ratio (100 = 1x)
		100, // Volume ratio (100 = 1x)
		0, // Pan
		0, // Attack
		0, // Decay
		100, // Sustain (100 = full volume)
		0, // Release
		0, // REG0
		0, // REG1
		0, // REG2
		0, // REG3
	];
}

export function createDefaultGlobalState(): GlobalState {
	return {
		bpm: 120,
		volume: 100,
	};
}

export class RegisterFile {
	private regs: number[] = createDefaultRegisters();

	snapshot() {
		return [...this.regs];
	}

	reset() {
		this.regs = createDefaultRegisters();
	}

	read(reg: Register): number {
		return this.regs[reg];
	}

	write(reg: Register, value: number) {
		this.regs[reg] = value;
	}
}

export interface SynthSettings {
	bpm: number;
	volume: number;
	pan: number;
	attack: number;
	decay: number;
	sustain: number;
	release: number;
}

export interface NoteEvent {
	instrument: Instrument;
	pitch: number;
	beat: number;
	duration: number;
	settings: SynthSettings;
	line?: number;
}

export interface CoreState {
	id: number;
	active: boolean;
	pc: number;
	tick: number;
	regs: number[];
}

export interface GlobalState {
	bpm: number;
	volume: number;
}

export interface RuntimeState {
	running: boolean;
	globals: GlobalState;
	memory: number[];
	cores: CoreState[];
}

export function createDefaultRuntimeState(): RuntimeState {
	return {
		running: false,
		globals: createDefaultGlobalState(),
		memory: new Array(MEMORY_SIZE).fill(0),
		cores: Array.from({ length: CORE_COUNT }, (i: number) => ({
			id: i,
			active: false,
			pc: 0,
			tick: 0,
			regs: createDefaultRegisters(),
		})),
	};
}
