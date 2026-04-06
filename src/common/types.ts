export enum Opcode {
	NOP, PLAY, REST, LOAD, STORE, ADD, JUMP, JMPZ,
}

export enum Register {
	VOL, PAN, ATK, DEC, SUS, REL, RAND, REG0, REG1, REG2, REG3,
}

export enum Instrument {
	SYNTH, DRUMS, BASS, PIANO,
}

export enum Parameter {
	BPM, VOL,
}

export type Operand =
	| { mode: "imm"; value: number }
	| { mode: "reg_read"; reg: Register }
	| { mode: "reg_write"; reg: Register }
	| { mode: "mem_direct"; address: number }
	| { mode: "mem_indirect"; reg: Register }
	| { mode: "label"; value: string }
	| { mode: "instrument"; value: Instrument };

export interface Instruction {
	opcode: Opcode;
	operands: Operand[];
}

export interface Program {
	instrs: Instruction[];
	labels: Record<string, number>;
}

export interface SynthSettings {
	volume: number;
	pan: number;
	attack: number;
	decay: number;
	sustain: number;
	release: number;
}

export interface NoteEvent {
	id: string;
	coreID: number;
	beat: number;
	instrument: Instrument;
	pitch: number;
	length: number;
	settings: SynthSettings;
}

export interface CoreState {
	id: number;
	enabled: boolean;
	pc: number;
	beat: number;
	regs: number[];
}

export interface TransportState {
	bpm: number;
	horizon: number;
}

export interface CPUState {
	memory: number[];
	parameters: number[];
	cores: CoreState[];
}

export interface RuntimeState {
	running: boolean;
	cpu: CPUState;
	transport: TransportState;
}

const CORE_PROGRAMS = [
	`; Core 0: melody
top:
LOAD VOL 54
LOAD ATK 10
LOAD DEC 180
LOAD REL 180

LOAD REG0 0 ; try setting this to eight!
LOAD REG1 8

loop:
PLAY PIANO [REG0] ; uses register as memory address
REST 4 ; try adjusting this!

ADD REG0 1
ADD REG1 -1
JMPZ REG1 top
JUMP loop`,
	`; Core 1: drums
LOAD VOL 88
LOAD PAN -10

PLAY DRUMS 60 ; uses immediate value
REST 2
PLAY DRUMS 62
REST 2
PLAY DRUMS 61
REST 2
PLAY DRUMS 62
REST 1
PLAY DRUMS 62
REST 1
PLAY DRUMS 60
REST 2
PLAY DRUMS 62
REST 2
PLAY DRUMS 61
REST 2
PLAY DRUMS 62
REST 2`,
	`; Core 2
LOAD VOL 42
LOAD ATK 10
LOAD DEC 180
LOAD REL 180

REST 2
PLAY PIANO 60
REST 2`,
];

export function getDefaultCoreProgram(coreId: number) {
	return CORE_PROGRAMS[coreId] ?? `; Core ${coreId}
; Press Ctrl+Enter to assign this program.
LOAD VOL 100

loop:
REST 1
JUMP loop`;
}
