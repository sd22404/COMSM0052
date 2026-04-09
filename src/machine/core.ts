import {
	CoreState,
	ExecEvent,
	Instruction,
	Instrument,
	Note,
	Opcode,
	Operand,
	Parameter,
	Program,
	Register,
	SynthSettings,
} from "@/common/types";
import { AccessLog } from "@/machine/log";
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
	span: { from: 0, to: 0 },
};

interface CoreConfig {
	id: number;
	log: AccessLog;
	memory: Memory;
	parameters: number[];
	program?: Program;
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
	constructor({ id, memory, log, parameters, program }: CoreConfig) {
		this.id = id;
		this.log = log;
		this.memory = memory;
		this.parameters = parameters;
		this.registers = new RegisterFile(this.id, this.log);
		this.program = program ?? { instrs: [], labels: {} };
	}

	private readonly id: number;
	private readonly log: AccessLog;
	private readonly memory: Memory;
	private readonly parameters: number[];
	private readonly registers: RegisterFile;
	private program: Program;
	private seq = 0;
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

	private eval(operand?: Operand): number {
		if (!operand) return 0;

		switch (operand.mode) {
			case "mem_direct":
				return this.memory.read(operand.address);
			case "mem_indirect": {
				const address = this.registers.read(operand.reg);
				return this.memory.read(address);
			}
			case "reg_read":
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

	execute(instr: Instruction): ExecEvent {
		const beat = this._beat;
		const mark = this.log.mark(this.id);
		const [raw1, raw2] = instr.operands;
		const [val1, val2] = [this.eval(raw1), this.eval(raw2)];
		let note: Note | undefined;

		switch (instr.opcode) {
			case Opcode.PLAY:
				note = this.createNote(val1 as Instrument, val2, 1); // TODO: implement duration
				break;
			case Opcode.REST:
				this._beat = clampBeat(this._beat + val1); // TODO: stall execution here for highlighting purposes?
				break;
			case Opcode.LOAD:
				this.registers.write(val1 as Register, val2);
				break;
			case Opcode.STORE:
				this.memory.write(val1, val2);
				break;
			case Opcode.ADD:
				this.registers.write(val1 as Register, this.registers.read(val1 as Register) + val2);
				break;
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
			id: this.seq++,
			coreID: this.id,
			beat,
			span: instr.span,
			log: this.log.since(this.id, mark),
			advanced: instr.opcode === Opcode.PLAY,
			note,
		};
	}

	execUntil(targetBeat: number): ExecEvent[] {
		const events: ExecEvent[] = [];
		if (!this._enabled) return events;
		if (this.program.instrs.length === 0) return events;
		let zeroTimeInstrs = 0;

		while (this._beat < targetBeat && zeroTimeInstrs < ZERO_TIME_BUDGET) {
			const event = this.execute(this.fetch(this._pc++));
			events.push(event);
			zeroTimeInstrs = event.advanced ? 0 : zeroTimeInstrs + 1;
		}

		return events;
	}

	private createNote(instrument: Instrument, pitch: number, length: number): Note {
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
