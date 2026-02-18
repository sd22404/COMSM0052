export enum Opcode {
	NOP = "NOP",
	PLAY = "PLAY",
	WAIT = "WAIT",
	JUMP = "JUMP",
	SET = "SET",
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
	REG3 = "REG3",
	REG4 = "REG4",
}

export interface Instruction {
	opcode: Opcode;
	operands: (Register | Instrument | number | string)[];
}

export interface Program {
	instructions: Instruction[];
	labels: Record<string, number>;
}
