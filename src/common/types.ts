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
	REL,
	REG0,
	REG1,
	REG2,
	REG3,
	RAND,
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
	| BaseInstruction<Opcode.PLAY, [DeviceOperand, ValOperand, ValOperand?]>
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
	tick: number;
	span: CodeSpan;
	log: EventLog;
	note?: Note;
}

export interface RuntimeFault {
	message: string;
	span: CodeSpan;
	tick: number;
	pc: number;
}

export interface CoreState {
	id: number;
	enabled: boolean;
	pc: number;
	tick: number;
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

export interface Sample {
	path: string;
	buf?: AudioBuffer;
	promise?: Promise<void>;
}

export interface SampleOption {
	id: string;
	label: string;
	path: string;
}

export function hasErrors(diagnostics: Diagnostic[]): boolean {
	return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

export type TutorialPanel = "controls" | "memory" | "samples";

export interface LessonCore {
	coreID: number;
	starterCode: string;
}

export type LessonStepType = "guide" | "concept" | "syntax" | "system" | "task";

export interface LessonStep {
	title: string;
	type: LessonStepType;
	body: string;
	bullets?: string[];
	code?: string;
	spotlightTargets?: string[];
}

export interface CodeLesson {
	id: string;
	title: string;
	steps: LessonStep[];
	visiblePanels: TutorialPanel[];
	cores: LessonCore[];
}

export interface TutorialProgress {
	lessonIndex: number;
	lessonStep: number;
}

export interface TutorialStatus {
	completed: boolean;
	skipped: boolean;
	progress: TutorialProgress;
}

const CORE_PROGRAMS = [
	`; Core 0: melody
; Try changing VOL for loudness, or ATK/REL for softer shapes.
top:
LOAD VOL 54 ; core 0 volume (0-100)
LOAD ATK 10 ; attack time in milliseconds
LOAD REL 180 ; release time in milliseconds

LOAD REG0 0 ; memory start address. try 8 for the second melody.
LOAD REG1 8 ; how many memory notes to play before restarting

loop:
PLAY PIANO [REG0] 1 ; [REG0] reads memory at the address held in REG0
REST 4 ; rhythm speed. Try 2 for faster notes or 8 for slower notes.

ADD REG0 1 ; move to the next memory address
ADD REG1 -1 ; count one note down
JMPZ REG1 top
JUMP loop`,
	`; Core 1: drums
; drum notes use the Drum Note Map: 60 kick, 61 snare, 62 hi-hat.
LOAD VOL 88 ;
LOAD PAN -10 ; negative pans left, positive pans right

PLAY DRUMS 60 ; kick
REST 2 ; change REST values to reshape the groove
PLAY DRUMS 62 ; hi-hat
REST 2
PLAY DRUMS 61 ; snare
REST 2
PLAY DRUMS 62 ; hi-hat
REST 1
PLAY DRUMS 62 ; a short extra hat hit
REST 1
PLAY DRUMS 60 ; kick
REST 2
PLAY DRUMS 62 ; hi-hat
REST 2
PLAY DRUMS 61 ; snare
REST 2
PLAY DRUMS 62 ; hi-hat
REST 2`,
	`; Core 2: offset piano
LOAD VOL 42
LOAD ATK 10 ; try 100 for a slower fade in
LOAD REL 180 ; try 500 for a longer tail

REST 2 ; wait before playing
PLAY PIANO 60 2 ; pitch 60 is middle C, 2 is duration in ticks
REST 2 ; wait before repeating loop`,
];

export function getDefaultCode(coreID: number) {
	return CORE_PROGRAMS[coreID] ?? `; Core ${coreID}
; write this program yourself!
LOAD VOL 100

loop:
REST 1
JUMP loop`;
}
