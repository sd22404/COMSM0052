export enum Opcode {
	NOP, PLAY, REST, LOAD, STORE, ADD, JUMP, JMPZ,
}

export enum Register {
	VOL, PAN, ATK, DEC, SUS, REL, REG0, REG1, REG2, REG3,
}

export enum Instrument {
	SYNTH, DRUMS, BASS, PIANO,
}

export enum Parameter {
	BPM, VOL,
}

export type Operand =
	| { mode: "imm"; value: number }
	| { mode: "reg"; reg: Register }
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
	`; Core 0: stacked synth chords
LOAD VOL 36
LOAD ATK 20
LOAD DEC 180
LOAD SUS 60
LOAD REL 240

PLAY SYNTH 60
PLAY SYNTH 64
PLAY SYNTH 67
REST 1
PLAY SYNTH 62
PLAY SYNTH 65
PLAY SYNTH 69
REST 1
PLAY SYNTH 59
PLAY SYNTH 62
PLAY SYNTH 67
REST 1
PLAY SYNTH 60
PLAY SYNTH 64
PLAY SYNTH 67
REST 1`,
	`; Core 1: drums
LOAD VOL 88
LOAD PAN -10

PLAY DRUMS 60
REST 1
PLAY DRUMS 62
REST 1
PLAY DRUMS 61
REST 1
PLAY DRUMS 62
REST 1`,
	`; Core 2: bass
LOAD VOL 72
LOAD DEC 120
LOAD SUS 55
LOAD REL 180

PLAY BASS 36
REST 2
PLAY BASS 43
REST 2`,
	`; Core 3: pan test
LOAD VOL 65
LOAD PAN 35
LOAD ATK 10
LOAD DEC 90
LOAD SUS 45
LOAD REL 200

PLAY PIANO 72
REST 2
PLAY PIANO 76
REST 2`,
];

export function getDefaultCoreProgram(coreId: number) {
	return CORE_PROGRAMS[coreId] ?? `; Core ${coreId}
; Press Ctrl+Enter or Load Core to assign this program.
LOAD VOL 100

loop:
REST 1
JUMP loop`;
}
