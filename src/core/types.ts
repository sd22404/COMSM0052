export enum Opcode {
	NOP = "NOP",
	PLAY = "PLAY",
	REST = "REST",
	JUMP = "JUMP",
	BRZ = "BRZ",
	SET = "SET",
	LOAD = "LOAD",
	ADD = "ADD",
}

export enum Instrument {
	SAMPLE = "SAMPLE",
	SYNTH = "SYNTH",
}

export enum Register {
	BPM = "BPM",
	VOL = "VOL",
	REG1 = "REG1",
	REG2 = "REG2",
}

export interface Operand {
	mode: "immediate" | "register" | "memory";
	type: "instrument" | "number" | "register" | "identifier";
	value: string | number;
}

export interface Instruction {
	opcode: Opcode;
	operands: Operand[];
	line: number;
}

export interface Program {
	instructions: Instruction[];
	labels: Record<string, number>;
}

export interface Track {
	name: string;
	program: Program;
	cursor: number;
	waitRemaining: number;
}