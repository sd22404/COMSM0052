export enum Opcode {
	NOP, PLAY, REST, LOAD, STORE, ADD, JUMP, JMPZ,
}

export enum Register {
	BPM, VOL, REG0, REG1
}

export enum Instrument {
	SYNTH, DRUMS, BASS, PIANO,
}

export type Operand =
	| { mode: "imm", value: number }
	| { mode: "reg", reg: Register }
	| { mode: "mem_direct", address: number }
	| { mode: "mem_indirect", reg: Register }
	| { mode: "label", value: string }
	| { mode: "instrument", value: Instrument };

export interface Instruction {
	opcode: Opcode;
	operands: Operand[];
}

export interface Program {
	instrs: Instruction[];
	labels: Record<string, number>;
}

export class Memory {
	private mem: number[] = new Array(128).fill(0);

	get data() {
		return this.mem;
	}

	read(addr: number): number {
		return this.mem[addr];
	}

	write(addr: number, value: number) {
		this.mem[addr] = value;
	}
}

export class RegisterFile {
	private regs: number[] = new Array(4).fill(0);

	get data() {
		return this.regs;
	}

	read(reg: Register): number {
		return this.regs[reg];
	}
	
	write(reg: Register, value: number) {
		this.regs[reg] = value;
	}
}

export interface NoteEvent {
	instrument: Instrument;
	pitch: number;
	duration: number;
	time?: number;
}

export interface CoreState {
	active: boolean;
	pc: number;
	regs: number[];
}

export interface RuntimeState {
	running: boolean;
	memory: number[];
	cores: CoreState[];
}
