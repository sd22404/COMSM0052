export enum Opcode {
	PLAY,
	REST,
	LOAD,
	STORE,
	ADD,
	JUMP,
	JMPZ,
}

export enum Register {
	VOL,
	PAN,
	ATK,
	DEC,
	SUS,
	REL,
	RAND,
	REG0,
	REG1,
	REG2,
	REG3,
}

export enum Device {
	SYNTH,
	DRUMS,
	BASS,
	PIANO,
}

export enum Parameter {
	BPM,
	VOL,
}

export interface CodeSpan {
	from: number;
	to: number;
}

export interface Diagnostic {
	severity: "error" | "warning" | "info";
	message: string;
	span: CodeSpan;
}

export enum OpType {
	Imm,
	Reg,
	Mem,
	Device,
	Label,
}

export interface ImmOperand {
	type: OpType.Imm;
	value: number;
	span: CodeSpan;
}

export interface RegOperand {
	type: OpType.Reg;
	reg: Register;
	span: CodeSpan;
}

export type AddrOperand = ImmOperand | RegOperand;
export type ValOperand = ImmOperand | RegOperand | MemOperand;

export interface MemOperand {
	type: OpType.Mem;
	addr: AddrOperand;
	span: CodeSpan;
}

export interface DeviceOperand {
	type: OpType.Device;
	device: Device;
	span: CodeSpan;
}

export interface LabelOperand {
	type: OpType.Label;
	addr: number;
	label?: string;
	span: CodeSpan;
}

interface BaseInstruction<Op extends Opcode, Ops extends readonly unknown[]> {
	opcode: Op;
	operands: Ops;
	span: CodeSpan;
}

export type Instruction =
	| BaseInstruction<Opcode.PLAY, [DeviceOperand, ValOperand]>
	| BaseInstruction<Opcode.REST, [ValOperand]>
	| BaseInstruction<Opcode.LOAD, [RegOperand, ValOperand]>
	| BaseInstruction<Opcode.STORE, [AddrOperand, ValOperand]>
	| BaseInstruction<Opcode.ADD, [RegOperand, ValOperand]>
	| BaseInstruction<Opcode.JUMP, [LabelOperand]>
	| BaseInstruction<Opcode.JMPZ, [RegOperand, LabelOperand]>;

export type Program = Instruction[];

export interface CompileResult {
	program?: Program;
	diagnostics: Diagnostic[];
}

export interface SynthSettings {
	volume: number;
	pan: number;
	attack: number;
	decay: number;
	sustain: number;
	release: number;
}

export interface Note {
	length: number;
	device: Device;
	pitch: number;
	settings: SynthSettings;
}

export interface PlayWindow {
	start: number;
	end: number;
}

export type AccessMode = "read" | "write";

export interface RegisterAccess {
	reg: Register;
	mode: AccessMode;
}

export interface MemoryAccess {
	addr: number;
	mode: AccessMode;
}

export interface EventLog {
	registers: RegisterAccess[];
	memory: MemoryAccess[];
}

export interface ExecEvent {
	id: number;
	coreID: number;
	beat: number;
	span: CodeSpan;
	log: EventLog;
	note?: Note;
}

export interface RuntimeFault {
	message: string;
	span: CodeSpan;
	beat: number;
	pc: number;
}

export interface CoreState {
	id: number;
	enabled: boolean;
	pc: number;
	beat: number;
	regs: number[];
	fault?: RuntimeFault;
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
	highlights: HighlightState;
	samples: Map<number, string>;
}

export interface HighlightState {
	code: CodeSpan[][];
	regs: RegisterAccess[][];
	memory: MemoryAccess[];
}

export interface TutorialState {
	active: boolean;
	title: string;
	text: string;
	anchorRef: string;
}

export interface Sample {
	path: string;
	buf?: AudioBuffer;
	promise?: Promise<void>;
}

export function hasErrors(diagnostics: Diagnostic[]): boolean {
	return diagnostics.some((diagnostic) => diagnostic.severity === "error");
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

export function getDefaultCode(coreID: number) {
	return CORE_PROGRAMS[coreID] ?? `; Core ${coreID}
; Press Ctrl+Enter to assign this program.
LOAD VOL 100

loop:
REST 1
JUMP loop`;
}
