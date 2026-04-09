import {
	CoreState,
	ExecutionTrace,
	Instruction,
	Instrument,
	MemoryHighlight,
	NoteEvent,
	Opcode,
	Operand,
	Parameter,
	Program,
	Register,
	RegisterHighlight,
	SynthSettings,
} from "@/common/types";
import { Memory } from "@/machine/memory";
import { RegisterFile, createDefaultRegisters } from "@/machine/regfile";

export function createDefaultCore(id: number): CoreState {
	return {
		id,
		enabled: false,
		pc: 0,
		beat: 0,
		regs: createDefaultRegisters(),
	};
}

const ZERO_TIME_BUDGET = 4096;
const NOP: Instruction = {
	opcode: Opcode.NOP,
	operands: [],
	range: { from: 0, to: 0 },
};

interface CoreConfig {
	id: number;
	memory: Memory;
	parameters: number[];
	program?: Program;
}

interface Result {
	trace: ExecutionTrace;
	advanced: boolean;
}

interface TraceContext {
	registers: RegisterHighlight[];
	memory: MemoryHighlight[];
}

function clampBeat(value: number) {
	return Math.max(0, value);
}

function createSynthSettings(registers: number[], parameters: number[]): SynthSettings {
	return {
		volume: Math.max(0, (parameters[Parameter.VOL] * registers[Register.VOL]) / 100),
		pan: registers[Register.PAN],
		attack: registers[Register.ATK],
		decay: registers[Register.DEC],
		sustain: registers[Register.SUS],
		release: registers[Register.REL],
	};
}

export class Core {
	constructor({ id, memory, parameters, program }: CoreConfig) {
		this.id = id;
		this.memory = memory;
		this.parameters = parameters;
		this.registers = new RegisterFile();
		this.program = program ?? { instrs: [], labels: {} };
	}

	private readonly id: number;
	private readonly memory: Memory;
	private readonly parameters: number[];
	private readonly registers: RegisterFile;
	private program: Program;
	private traceCounter = 0;
	private _enabled = false;
	private _pc = 0;
	private _beat = 0;

	get pc() {
		return this._pc;
	}

	get beat() {
		return this._beat;
	}

	get regs() {
		return this.registers.snapshot();
	}

	get enabled() {
		return this._enabled;
	}

	get state(): CoreState {
		return {
			id: this.id,
			enabled: this.enabled,
			pc: this.pc,
			beat: this.beat,
			regs: this.regs,
		};
	}

	load(program: Program) {
		this.program = program;
		this._pc = this.normalise(this._pc);
	}

	setRegister(reg: Register, val: number) {
		this.registers.write(reg, val);
	}

	reset(startBeat = 0) {
		this.registers.reset();
		this.rewind(startBeat);
	}

	toggle() {
		this._enabled = !this._enabled;
	}

	private eval(operand: Operand | undefined, trace: TraceContext): number {
		if (!operand) return 0;

		switch (operand.mode) {
			case "mem_direct":
				trace.memory.push({
					addr: this.memory.normalise(operand.address),
					mode: "read",
				});
				return this.memory.read(operand.address);
			case "mem_indirect": {
				trace.registers.push({
					reg: operand.reg,
					mode: "read",
				});
				const address = this.registers.read(operand.reg);
				trace.memory.push({
					addr: this.memory.normalise(address),
					mode: "read",
				});
				return this.memory.read(address);
			}
			case "reg_read":
				trace.registers.push({
					reg: operand.reg,
					mode: "read",
				});
				return this.registers.read(operand.reg);
			case "reg_write":
				return operand.reg;
			case "label":
				return this.program.labels[operand.value] ?? 0;
			default:
				return operand.value;
		}
	}

	private normalise(pc: number): number {
		if (this.program.instrs.length === 0) return 0;
		return (pc % this.program.instrs.length + this.program.instrs.length) % this.program.instrs.length;
	}

	private fetch(pc: number): Instruction {
		if (this.program.instrs.length === 0) return NOP;
		return this.program.instrs[this.normalise(pc)];
	}

	execute(instr: Instruction): Result {
		const beat = this._beat;
		const trace: TraceContext = {
			registers: [],
			memory: [],
		};
		const [raw1, raw2] = instr.operands;
		const [val1, val2] = [this.eval(raw1, trace), this.eval(raw2, trace)];
		let event: NoteEvent | undefined;

		switch (instr.opcode) {
			case Opcode.PLAY:
				event = this.createEvent(val1 as Instrument, val2, 1); // TODO: implement duration
				break;
			case Opcode.REST:
				this._beat = clampBeat(this._beat + val1);
				break;
			case Opcode.LOAD:
				this.registers.write(val1 as Register, val2);
				trace.registers.push({
					reg: val1 as Register,
					mode: "write",
				});
				break;
			case Opcode.STORE:
				this.memory.write(val1, val2);
				trace.memory.push({
					addr: this.memory.normalise(val1),
					mode: "write",
				});
				break;
			case Opcode.ADD: {
				trace.registers.push({
					reg: val1 as Register,
					mode: "read",
				});
				this.registers.write(val1 as Register, this.registers.read(val1 as Register) + val2);
				trace.registers.push({
					reg: val1 as Register,
					mode: "write",
				});
				break;
			}
			case Opcode.JUMP:
				this._pc = this.normalise(val1);
				break;
			case Opcode.JMPZ:
				if (val1 === 0) this._pc = this.normalise(val2);
				break;
			case Opcode.NOP:
			default:
				break;
		}

		return {
			trace: {
				id: `${this.id}:${this.traceCounter++}`,
				coreID: this.id,
				beat,
				instruction: instr,
				registers: trace.registers,
				memory: trace.memory,
				event,
			},
			advanced: instr.opcode === Opcode.PLAY,
		};
	}

	renderUntil(targetBeat: number): ExecutionTrace[] {
		const traces: ExecutionTrace[] = [];
		if (!this._enabled) return traces;
		if (this.program.instrs.length === 0) return traces;
		let zeroTimeInstrs = 0;

		while (this._beat < targetBeat && zeroTimeInstrs < ZERO_TIME_BUDGET) {
			const { trace, advanced } = this.execute(this.fetch(this._pc++));
			traces.push(trace);
			zeroTimeInstrs = advanced ? 0 : zeroTimeInstrs + 1;
		}

		return traces;
	}

	private createEvent(
		instrument: Instrument,
		pitch: number,
		length: number,
	): NoteEvent {
		return {
			length,
			instrument,
			pitch,
			settings: createSynthSettings(this.regs, this.parameters),
		};
	}

	rewind(startBeat = 0) {
		this._pc = 0;
		this._beat = clampBeat(startBeat);
	}
}
