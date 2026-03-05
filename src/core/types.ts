export enum Opcode {
	NOP = "NOP",
	PLAY = "PLAY",
	WAIT = "WAIT",
	JUMP = "JUMP",
	SET = "SET",
	LOAD = "LOAD",
	ADD = "ADD",
}

export enum Instrument {
	DRUM = "DRUM",
	SYNTH = "SYNTH",
}

export enum Register {
	BPM = "BPM",
	VOL = "VOL",
	REG1 = "REG1",
	REG2 = "REG2",
}

export interface Instruction {
	opcode: Opcode;
	operands: (Register | Instrument | number | string)[];
}

export interface Program {
	instructions: Instruction[];
	labels: Record<string, number>;
}

export interface Track {
	name: string;
	start: number;
	program: Program;
	cursor: number;
	currentBeat: number;
}