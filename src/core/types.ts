export enum Opcode {
	NOP = "NOP",
	PLAY = "PLAY",
	REST = "REST",
	JUMP = "JUMP",
	BRZ = "BRZ",
	ADD = "ADD",
	LOAD = "LOAD",
	STORE = "STORE",
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

export interface Operand {
	mode: "immediate" | "memory";
	type: "instrument" | "register" | "number" | "string";
	value: string | number;
}

export interface Instruction {
	opcode: Opcode;
	operands: Operand[];
	line: number;
}

export interface Track {
	name: string;
	instrs: Instruction[];
	labels: Record<string, number>;
	pc: number;
	time: number;
}

export interface NoteEvent {
	instrument: Instrument;
	pitch: number;
	duration?: number;
	time: number;
	line: number;
}
