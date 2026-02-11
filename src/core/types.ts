export enum Opcode {
	NOP = "NOP",
	PLAY = "PLAY",
	WAIT = "WAIT",
	JUMP = "JUMP",
	SET = "SET",
}

export enum Instrument {
	DRUM = "DRUM",
	PIANO = "PIANO",
}

export enum Register {
	BPM = "BPM",
	VOL = "VOL",
}

export interface Instruction {
	opcode: Opcode;
	operands: (Register | Instrument | number | string)[];
}

export interface Program {
	instructions: Instruction[];
	labels: Record<string, number>;
}
